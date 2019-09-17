import { ErrorHandler, ErrorType } from './error_handler';
import {
  RequestParams,
  UploaderOptions,
  UploadState,
  UploadStatus,
  UploadxControlEvent
} from './interfaces';
import { store } from './store';
import { actionToStatusMap, createHash, isNumber, noop, unfunc } from './utils';

/**
 * Uploader Base Class
 */
export abstract class Uploader implements UploadState {
  /** Maximum chunk size in bytes */
  static maxChunkSize = Number.MAX_SAFE_INTEGER;

  /** Minimum chunk size in bytes */
  static minChunkSize = 4096; // default blocksize of most FSs

  /** Initial chunk size in bytes */
  static startingChunkSize = 4096 * 256;

  set status(s: UploadStatus) {
    if (this._status === 'cancelled' || (this._status === 'complete' && s !== 'cancelled')) {
      return;
    }
    if (s !== this._status) {
      s === 'paused' && this.abort();
      s === 'cancelled' && this.onCancel();
      ['cancelled', 'complete', 'error'].includes(s) && this.cleanup();
      this._status = s;
      this.stateChange(this);
    }
  }
  get status() {
    return this._status;
  }
  private _status: UploadStatus;
  readonly name: string;
  readonly size: number;
  readonly uploadId: string;
  response: any;
  responseStatus: number;
  progress: number;
  remaining: number;
  speed: number;
  get url(): string {
    return this._url || store.get(this.uploadId) || '';
  }
  set url(value: string) {
    this._url !== value && store.set(this.uploadId, value);
    this._url = value;
  }
  protected _url = '';

  /** Custom headers */
  headers: Record<string, any> = {};

  /** Metadata Object */
  metadata: Record<string, any>;

  /** Upload endpoint */
  endpoint = '/upload';

  /**
   * Chunk size in bytes
   */
  chunkSize: number;
  /**
   * Auth Bearer token/tokenGetter
   */
  token: UploadxControlEvent['token'];
  /**
   * Retries handler
   */
  protected errorHandler = new ErrorHandler();
  /**
   * Active HttpRequest
   */
  protected _xhr: XMLHttpRequest;
  /**
   * byte offset within the whole file
   */
  protected offset? = 0;
  /**
   * Set HttpRequest responseType
   */
  protected responseType: XMLHttpRequestResponseType = '';
  private startTime: number;

  private stateChange: (evt: UploadState) => void;

  private cleanup = () => store.delete(this.uploadId);

  constructor(readonly file: File, public options: UploaderOptions) {
    this.name = file.name;
    this.size = file.size;
    this.metadata = {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
    const print = JSON.stringify({
      ...this.metadata,
      type: this.constructor.name,
      endpoint: options.endpoint
    });
    this.uploadId = createHash(print).toString(16);
    this.stateChange = options.stateChange || noop;
    this.chunkSize = options.chunkSize || Uploader.startingChunkSize;
    this.configure(options);
  }

  /**
   * Configure or reconfigure uploader
   */
  configure({ metadata = {}, headers = {}, token, endpoint, action }: UploadxControlEvent): void {
    this.endpoint = endpoint || this.endpoint;
    this.token = token || this.token;
    this.metadata = { ...this.metadata, ...unfunc(metadata, this.file) };
    this.headers = { ...this.headers, ...unfunc(headers, this.file) };
    action && (this.status = actionToStatusMap[action]);
  }

  /**
   * Initiate upload
   */
  async upload(): Promise<void> {
    this.status = 'uploading';
    try {
      await this.getToken();
      this.offset = undefined;
      this.url = this.url || (await this.getFileUrl());
      this.errorHandler.reset();
      this.startTime = new Date().getTime();
      this.start();
    } catch {
      if (this.errorHandler.kind(this.responseStatus) !== ErrorType.Fatal) {
        await this.waitForRetry();
        this.status = 'queue';
      } else {
        this.status = 'error';
      }
    }
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

  protected setAuth(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  private adjustChunkSize(): void {
    if (!this.options.chunkSize && this.responseStatus < 400) {
      const elapsedTime = this.chunkSize / this.speed;
      if (elapsedTime < 2) {
        this.chunkSize = Math.min(Uploader.maxChunkSize, this.chunkSize * 2);
      }
      if (elapsedTime > 8) {
        this.chunkSize = Math.max(Uploader.minChunkSize, this.chunkSize / 2);
      }
    } else if (this.responseStatus === 413) {
      this.chunkSize /= 2;
      Uploader.maxChunkSize = this.chunkSize;
    }
    Uploader.startingChunkSize = this.chunkSize;
  }

  protected abort(): void {
    this.offset = undefined;
    this._xhr && this._xhr.abort();
  }

  protected onCancel(): void {
    this.abort();
    this.url && this.request({ method: 'DELETE' });
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
  protected getToken(): Promise<any> {
    return Promise.resolve(unfunc(this.token || '', this.responseStatus)).then(
      token => token && this.setAuth(token)
    );
  }

  /**
   * Starts the actual uploading
   */
  async start() {
    while (this.status === 'uploading' || this.status === 'retry') {
      try {
        const offset = isNumber(this.offset)
          ? await this.sendFileContent()
          : await this.getOffset();
        if (offset === this.size) {
          this.offset = offset;
          this.progress = 100;
          this.remaining = 0;
          this.status = 'complete';
        } else if (offset === this.offset) {
          throw new Error('Content upload failed');
        }
        this.errorHandler.reset();
        this.offset = offset;
      } catch {
        const errType = this.errorHandler.kind(this.responseStatus);
        if (errType === ErrorType.Fatal) {
          this.status = 'error';
          break;
        }
        if (errType === ErrorType.Restart) {
          this.url = '';
          this.status = 'queue';
          break;
        }
        if (errType === ErrorType.Auth) {
          await this.getToken();
          continue;
        }
        await this.waitForRetry();
        this.offset = this.responseStatus >= 400 ? undefined : this.offset;
        this.status = 'uploading';
      } finally {
        this.adjustChunkSize();
      }
    }
  }

  /**
   * Request method
   */
  protected request({
    method,
    body = null,
    url,
    headers = {}
  }: RequestParams): Promise<ProgressEvent> {
    return new Promise((resolve, reject) => {
      const xhr = (this._xhr = new XMLHttpRequest());
      xhr.open(method, url || this.url, true);
      if (body instanceof Blob) {
        xhr.upload.onprogress = this.onProgress(body.size);
      }
      this.responseStatus = 0;
      this.response = undefined;
      this.responseType && (xhr.responseType = this.responseType);
      this.options.withCredentials && (xhr.withCredentials = true);
      const _headers = { ...this.headers, ...headers };
      Object.keys(_headers).forEach(key => xhr.setRequestHeader(key, _headers[key]));
      xhr.onload = (evt: ProgressEvent) => {
        this.processResponse(xhr);
        this.responseStatus >= 400 ? reject(evt) : resolve(evt);
      };
      xhr.onerror = reject;
      xhr.send(body);
    });
  }

  private getResponseBody(xhr: XMLHttpRequest): any {
    let body = 'response' in (xhr as any) ? xhr.response : xhr.responseText;
    if (body && this.responseType === 'json' && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }

  protected getChunk() {
    const start = this.offset as number;
    const end = this.chunkSize ? Math.min(start + this.chunkSize, this.size) : this.size;
    const body = this.file.slice(this.offset, end);
    return { start, end, body };
  }

  private processResponse(xhr: XMLHttpRequest): void {
    this.responseStatus = xhr.status;
    this.response = this.responseStatus !== 204 ? this.getResponseBody(xhr) : '';
  }

  private onProgress(chunkSize: number): (evt: ProgressEvent) => void {
    let throttle = 0;
    return ({ loaded }: ProgressEvent) => {
      if (!throttle) {
        throttle = window.setTimeout(() => (throttle = 0), 500);
        const now = new Date().getTime();
        const uploaded = (this.offset as number) + chunkSize * (loaded / chunkSize);
        this.progress = +((uploaded / this.size) * 100).toFixed(2);
        const elapsedTime = (now - this.startTime) / 1000;
        this.speed = Math.round(uploaded / elapsedTime);
        this.remaining = Math.ceil((this.size - uploaded) / this.speed);
        this.stateChange(this);
      }
    };
  }

  private waitForRetry(): Promise<number> {
    this.status = 'retry';
    return this.errorHandler.wait(this.responseStatus);
  }
}
