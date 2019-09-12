import { BackoffRetry } from './backoff_retry';
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
  /**
   * Codes should not be retried
   * @beta
   */
  static fatalErrors = [400, 403, 405, 406];
  /**
   * Restart codes
   * @beta
   */
  static notFoundErrors = [404, 410];
  static authErrors = [401];
  /**
   * Max HTTP errors
   */
  static maxRetryAttempts = 8;
  /**
   * Maximum chunk size in bytes
   */
  static maxChunkSize = Number.MAX_SAFE_INTEGER;
  /**
   * Minimum chunk size in bytes
   */
  static minChunkSize = 4096; // default blocksize of most FSs
  /**
   * Initial chunk size in bytes
   */
  static startingChunkSize = 4096 * 256;
  /**
   * Upload status
   */
  set status(s: UploadStatus) {
    if (this._status === 'cancelled' || (this._status === 'complete' && s !== 'cancelled')) {
      return;
    }
    if (s !== this._status) {
      s === 'paused' && this.abort();
      s === 'cancelled' && this.onCancel();
      this.isFinalEvent(s) && this.cleanup();
      this._status = s;
      this.stateChange(this);
    }
  }
  get status() {
    return this._status;
  }
  /**
   * Original File name
   */
  readonly name: string;
  /**
   * File size in bytes
   */
  readonly size: number;
  /**
   * File MIME type
   */
  readonly mimeType: string;
  readonly uploadId: string;
  /**
   * HTTP response status code
   */
  responseStatus: number;

  /**
   * Progress percentage
   */
  progress: number;
  /**
   * ETA
   */
  remaining: number;
  /**
   * Upload speed bytes/sec
   */
  speed: number;
  /**
   * File URI
   */
  protected _url = '';
  get url(): string {
    return this._url || store.get(this.uploadId);
  }
  set url(value: string) {
    this._url !== value && store.set(this.uploadId, value);
    this._url = value;
  }
  /**
   * Custom headers
   */
  headers: Record<string, any> = {};
  /**
   * Metadata Object
   */
  metadata: Record<string, any>;
  /**
   * Upload endpoint
   */
  endpoint = '/upload';
  /**
   * HTTP response body
   */
  response: any;
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
  protected retry = new BackoffRetry();
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
  /**
   * Upload start time
   */
  private startTime: number;
  private _status: UploadStatus;
  private get isFatalError(): boolean {
    return Uploader.fatalErrors.includes(this.responseStatus);
  }
  private get isAuthError(): boolean {
    return Uploader.authErrors.includes(this.responseStatus);
  }
  private get isNotFoundError(): boolean {
    return Uploader.notFoundErrors.includes(this.responseStatus);
  }
  private get isMaxAttemptsReached(): boolean {
    return this.retry.retryAttempts === Uploader.maxRetryAttempts;
  }
  /**
   * UploadState emitter
   */
  private stateChange: (evt: UploadState) => void;

  private cleanup = () => store.remove(this.uploadId);
  private isFinalEvent = (event: UploadStatus): boolean =>
    ['cancelled', 'complete', 'error'].includes(event);

  constructor(readonly file: File, public options: UploaderOptions) {
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.metadata = {
      name: this.name,
      mimeType: this.mimeType,
      size: this.size,
      lastModified: this.file.lastModified
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
      this.retry.reset();
      this.startTime = new Date().getTime();
      this.start();
    } catch {
      if (this.isMaxAttemptsReached || this.isFatalError) {
        this.status = 'error';
      } else {
        await this.waitForRetry();
        this.status = 'queue';
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

  protected abstract setAuth(token: string): void;

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
        if (isNumber(offset) && offset >= this.size) {
          this.offset = offset;
          this.progress = 100;
          this.remaining = 0;
          this.status = 'complete';
        } else if (offset === this.offset) {
          throw new Error('Content upload failed');
        }
        this.retry.reset();
        this.offset = offset;
      } catch {
        if (this.isFatalError || this.isMaxAttemptsReached) {
          this.status = 'error';
          break;
        }
        if (this.isNotFoundError) {
          this.url = '';
          this.status = 'queue';
          break;
        }
        await this.waitForRetry();
        this.isAuthError && (await this.getToken());
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
      this._xhr = new XMLHttpRequest();
      const xhr = this._xhr;
      xhr.open(method, url || this.url, true);
      if (body instanceof Blob) {
        xhr.upload.onprogress = this.onProgress(body.size);
      }
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
    return this.retry.wait(this.responseStatus);
  }
}
