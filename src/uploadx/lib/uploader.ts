import { ErrorHandler, ErrorType } from './error-handler';
import {
  Metadata,
  RequestHeaders,
  RequestOptions,
  ResponseBody,
  UploadAction,
  UploaderOptions,
  UploadEvent,
  UploadState,
  UploadStatus,
  UploadxControlEvent
} from './interfaces';
import { store } from './store';
import { createHash, DynamicChunk, isNumber, noop, unfunc } from './utils';

const actionToStatusMap: { [K in UploadAction]: UploadStatus } = {
  pause: 'paused',
  upload: 'queue',
  cancel: 'cancelled'
};

/**
 * Uploader Base Class
 */
export abstract class Uploader implements UploadState {
  readonly name: string;
  readonly size: number;
  readonly uploadId: string;
  response: ResponseBody = null;
  responseStatus!: number;
  progress!: number;
  remaining!: number;
  speed!: number;
  /** Custom headers */
  headers: RequestHeaders = {};
  /** Metadata Object */
  metadata: Metadata;
  /** Upload endpoint */
  endpoint = '/upload';
  /** Chunk size in bytes */
  chunkSize: number;
  /** Auth token/tokenGetter */
  token: UploadxControlEvent['token'];
  /** Retries handler */
  protected errorHandler = new ErrorHandler();
  /** Active HttpRequest */
  protected _xhr!: XMLHttpRequest;
  /** byte offset within the whole file */
  protected offset? = 0;
  /** Set HttpRequest responseType */
  protected responseType: XMLHttpRequestResponseType = '';
  private readonly prerequest: (
    req: RequestOptions
  ) => Promise<RequestOptions> | RequestOptions | void;
  private startTime!: number;
  private readonly stateChange: (evt: UploadEvent) => void;

  private _url = '';

  get url(): string {
    return this._url || store.get(this.uploadId) || '';
  }

  set url(value: string) {
    this._url !== value && store.set(this.uploadId, value);
    this._url = value;
  }

  private _status!: UploadStatus;

  get status(): UploadStatus {
    return this._status;
  }

  set status(s: UploadStatus) {
    if (this._status === 'cancelled' || (this._status === 'complete' && s !== 'cancelled')) {
      return;
    }
    if (s !== this._status) {
      s === 'paused' && this.abort();
      this._status = s;
      ['cancelled', 'complete', 'error'].indexOf(s) !== -1 && this.cleanup();
      s === 'cancelled' ? this.onCancel() : this.stateChange(this);
    }
  }

  constructor(readonly file: File, readonly options: UploaderOptions) {
    this.name = file.name;
    this.size = file.size;
    this.metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      lastModified:
        file.lastModified || (file as File & { lastModifiedDate: Date }).lastModifiedDate.getTime()
    };
    const print = JSON.stringify({
      ...this.metadata,
      type: this.constructor.name,
      endpoint: options.endpoint
    });
    this.uploadId = createHash(print).toString(16);
    this.stateChange = options.stateChange || noop;
    this.prerequest = options.prerequest || noop;
    this.chunkSize = options.chunkSize || this.size;
    this.configure(options);
  }

  /**
   * Configure uploader
   */
  configure({ metadata = {}, headers = {}, token, endpoint, action }: UploadxControlEvent): void {
    this.endpoint = endpoint || this.endpoint;
    this.token = token || this.token;
    this.metadata = { ...this.metadata, ...unfunc(metadata, this.file) };
    this.headers = { ...this.headers, ...unfunc(headers, this.file) };
    action && (this.status = actionToStatusMap[action]);
  }

  /**
   * Starts uploading
   */
  async upload(): Promise<void> {
    this.status = 'uploading';
    try {
      await this.updateToken();
      this.offset = undefined;
      this.startTime = new Date().getTime();
      this.url = this.url || (await this.getFileUrl());
      this.errorHandler.reset();
      this.start().then(_ => {});
    } catch (e) {
      e instanceof Error && console.error(e);
      if (this.errorHandler.kind(this.responseStatus) !== ErrorType.Fatal) {
        this.status = 'retry';
        await this.errorHandler.wait();
        this.status = 'queue';
      } else {
        this.status = 'error';
      }
    }
  }

  /**
   * Starts chunk upload
   */
  async start(): Promise<void> {
    while (this.status === 'uploading' || this.status === 'retry') {
      if (this.offset !== this.size) {
        try {
          const offset = isNumber(this.offset)
            ? await this.sendFileContent()
            : await this.getOffset();
          if (offset === this.offset) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Content upload failed');
          }
          this.errorHandler.reset();
          this.offset = offset;
        } catch (e) {
          e instanceof Error && console.error(e);
          const errType = this.errorHandler.kind(this.responseStatus);
          if (this.responseStatus === 413) {
            DynamicChunk.maxSize = this.chunkSize /= 2;
          } else if (errType === ErrorType.Fatal) {
            this.status = 'error';
          } else if (errType === ErrorType.NotFound) {
            this.url = '';
            this.status = 'queue';
          } else if (errType === ErrorType.Auth) {
            await this.updateToken();
          } else {
            this.status = 'retry';
            await this.errorHandler.wait();
            this.offset = this.responseStatus >= 400 ? undefined : this.offset;
            this.status = 'uploading';
          }
        }
      } else {
        this.progress = 100;
        this.remaining = 0;
        this.status = 'complete';
      }
    }
  }

  /**
   * Performs http requests
   */
  async request(req: RequestOptions): Promise<ProgressEvent> {
    return this._request((await this.prerequest(req)) || req);
  }

  /**
   * Get response body after request has been sent
   */
  getResponseBody(xhr: XMLHttpRequest): ResponseBody {
    let body = 'response' in (xhr as XMLHttpRequest) ? xhr.response : xhr.responseText;
    if (body && this.responseType === 'json' && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }

  /**
   * Get file URI
   */
  protected abstract getFileUrl(): Promise<string>;

  /**
   * Send file content and return an offset for the next request
   */
  protected abstract sendFileContent(): Promise<number | undefined>;

  /**
   * Get an offset for the next request
   */
  protected abstract getOffset(): Promise<number | undefined>;

  protected setAuth(token: string): void {
    this.headers.Authorization = `Bearer ${token}`;
  }

  protected abort(): void {
    this.offset = undefined;
    this._xhr && this._xhr.abort();
  }

  protected onCancel(): void {
    this.abort();
    const stateChange = () => this.stateChange(this);
    if (this.url) {
      this.request({ method: 'DELETE' }).then(stateChange, stateChange);
    } else {
      stateChange();
    }
  }

  /**
   * Gets the value from the response
   */
  protected getValueFromResponse(key: string): string | null {
    return this._xhr.getResponseHeader(key);
  }

  /**
   * Set auth token
   */
  protected async updateToken(): Promise<string | void> {
    if (this.token) {
      const token = await unfunc(this.token, this.responseStatus);
      this.setAuth(token);
    }
  }

  protected getChunk(): { start: number; end: number; body: Blob } {
    this.chunkSize = isNumber(this.options.chunkSize) ? this.chunkSize : DynamicChunk.size;
    const start = this.offset || 0;
    const end = Math.min(start + this.chunkSize, this.size);
    const body = this.file.slice(this.offset, end);
    return { start, end, body };
  }

  private _request(req: RequestOptions): Promise<ProgressEvent> {
    return new Promise((resolve, reject) => {
      const xhr = (this._xhr = new XMLHttpRequest());
      xhr.open(req.method, req.url || this.url, true);
      if (req.body instanceof Blob || (req.body && req.progress)) {
        xhr.upload.onprogress = this.onProgress();
      }
      this.responseStatus = 0;
      this.response = null;
      this.responseType && (xhr.responseType = this.responseType);
      this.options.withCredentials && (xhr.withCredentials = true);
      const _headers = { ...this.headers, ...(req.headers || {}) };
      Object.keys(_headers).forEach(key => xhr.setRequestHeader(key, String(_headers[key])));
      xhr.onload = evt => {
        this.responseStatus = xhr.status;
        this.response = this.getResponseBody(xhr);
        this.responseStatus >= 400 ? reject(evt) : resolve(evt);
      };
      xhr.onerror = reject;
      xhr.send(req.body);
    });
  }

  private cleanup = () => store.delete(this.uploadId);

  private onProgress(): (evt: ProgressEvent) => void {
    let throttle = 0;
    return ({ loaded }: ProgressEvent) => {
      const now = new Date().getTime();
      const uploaded = (this.offset as number) + loaded;
      const elapsedTime = (now - this.startTime) / 1000;
      this.speed = Math.round(uploaded / elapsedTime);
      DynamicChunk.scale(this.speed);
      if (!throttle) {
        throttle = window.setTimeout(() => (throttle = 0), 500);
        this.progress = +((uploaded / this.size) * 100).toFixed(2);
        this.remaining = Math.ceil((this.size - uploaded) / this.speed);
        this.stateChange(this);
      }
    };
  }
}
