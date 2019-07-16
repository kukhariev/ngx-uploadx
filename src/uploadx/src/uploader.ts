import { BackoffRetry } from './backoff_retry';
import {
  UploaderOptions,
  UploadState,
  UploadStatus,
  UploadxControlEvent,
  RequestParams
} from './interfaces';
import { actionToStatusMap, noop, unfunc } from './utils';

/**
 * Uploader Base Class
 */
export abstract class Uploader implements UploadState {
  /**
   * Codes should not be retried
   * @beta
   */
  static fatalErrors = [400, 403];
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
   * Maximum chunk size
   */
  static maxChunkSize = Number.MAX_SAFE_INTEGER;
  /**
   * Minimum chunk size
   */
  static minChunkSize = 4096; // default blocksize of most FSs
  /**
   * Initial chunk size
   */
  static startingChunkSize = Uploader.minChunkSize * 64;
  /**
   * Upload status
   */
  set status(s: UploadStatus) {
    if (
      s === this._status ||
      this._status === 'cancelled' ||
      (this._status === 'complete' && s !== 'cancelled')
    ) {
      return;
    }
    (s === 'cancelled' || s === 'paused') && this.abort();
    s === 'cancelled' && this.url && this.onCancel();

    this._status = s;
    this.notifyState();
  }
  get status() {
    return this._status;
  }

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
  readonly uploadId = Math.random()
    .toString(36)
    .substring(2, 15);
  /**
   * HTTP response status code
   */
  responseStatus: number;
  /**
   * Upload start time
   */
  private startTime: number;
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
  url: string;
  /**
   * Custom headers
   */
  headers: { [key: string]: string } = {};
  /**
   * Metadata Object
   */
  metadata: { [key: string]: any };
  /**
   * Upload endpoint
   */
  endpoint = '/upload';

  /**
   * Retries handler
   */
  protected retry = new BackoffRetry();
  /**
   * HTTP response body
   */
  response: any;
  /**
   * HTTP response status category
   */
  protected statusType: 200 | 300 | 400 | 500;
  /**
   * Chunk size in bytes
   */
  chunkSize: number;
  /**
   * Auth Bearer token/tokenGetter
   */
  token?: UploadxControlEvent['token'];
  /**
   * Status of uploader
   */
  private _status: UploadStatus;
  /**
   * Set HttpRequest responseType
   */
  protected responseType: XMLHttpRequestResponseType = '';
  /**
   * UploadState emitter
   */
  private stateChange: (evt: UploadState) => void;
  /**
   * Active HttpRequest
   */
  protected _xhr: XMLHttpRequest;
  /**
   * byte offset within the whole file
   */
  protected offset = 0;

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
    this.stateChange = options.stateChange || noop;
    this.chunkSize = options.chunkSize || Uploader.startingChunkSize;
    this.configure(options);
  }

  /**
   * Configure or reconfigure uploader
   */
  configure(config = {} as UploadxControlEvent): void {
    const { metadata, headers, token, endpoint, action } = config;
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
      this.url = await this.getFileUrl();
      this.retry.reset();
      this.startTime = new Date().getTime();
      this.start();
    } catch (e) {
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
   * Send file content
   */
  protected abstract sendFileContent(): Promise<number>;
  /**
   * Get an offset for the next request
   */
  protected abstract getOffset(): Promise<number>;

  protected abstract setAuth(token: string): void;

  /**
   * Emit current state
   */
  private notifyState(): void {
    const state: UploadState = {
      file: this.file,
      name: this.name,
      progress: this.progress,
      remaining: this.remaining,
      response: this.response,
      responseStatus: this.responseStatus,
      size: this.size,
      speed: this.speed,
      status: this.status,
      uploadId: this.uploadId,
      url: this.url
    };

    this.stateChange(state);
  }

  // Increases the chunkSize if the time of the request
  // is less than 1 second,
  // and decreases it if more than 10 seconds.
  // Decreases on `Payload Too Large` error
  private adjustChunkSize() {
    if (!this.options.chunkSize && this.responseStatus < 400) {
      const t = this.chunkSize / this.speed;
      if (t < 1 && this.chunkSize < Uploader.maxChunkSize) {
        this.chunkSize *= 2;
        Uploader.startingChunkSize = this.chunkSize / 4;
      }
      if (t > 10 && this.chunkSize > Uploader.minChunkSize) {
        this.chunkSize /= 2;
        Uploader.startingChunkSize = this.chunkSize * 2;
      }
    } else if (this.responseStatus === 413) {
      this.chunkSize /= 2;
      Uploader.maxChunkSize = this.chunkSize;
    }
  }

  protected abort(): void {
    this._xhr && this._xhr.abort();
  }

  protected onCancel(): void {}

  /**
   * Gets the value from the response
   */
  protected getValueFromResponse(key: string): string {
    return this._xhr.getResponseHeader(key);
  }

  /**
   * Set auth token
   */
  protected getToken(): Promise<void> {
    return Promise.resolve(unfunc(this.token, this.responseStatus)).then(
      token => token && this.setAuth(token)
    );
  }

  /**
   * Starts the actual uploading
   */
  async start() {
    while (this.status === 'uploading' || this.status === 'retry') {
      try {
        const offset = this.offset >= 0 ? await this.sendFileContent() : await this.getOffset();
        if (offset === this.offset) {
          throw new Error('Content upload failed');
        }
        this.retry.reset();
        this.offset = offset;
        if (this.offset >= this.size) {
          this.progress = 100;
          this.status = 'complete';
        }
      } catch {
        if (this.isFatalError || this.isMaxAttemptsReached) {
          this.status = 'error';
          break;
        }
        if (this.isNotFoundError) {
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
    headers = {},
    progress = false
  }: RequestParams): Promise<number> {
    return new Promise((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open(method, url || this.url, true);
      if (progress && body) {
        xhr.upload.onprogress = this.onProgress((body as any).size);
      }
      this.setupXhr(xhr, headers);
      xhr.onload = () => {
        this.processResponse(xhr);
        this.statusType > 300 ? reject(this.responseStatus) : resolve(this.responseStatus);
      };
      xhr.onerror = reject;
      xhr.send(body);
    });
  }

  private setupXhr(xhr: XMLHttpRequest, headers?: any) {
    this.responseStatus = undefined;
    this.response = undefined;
    this.statusType = undefined;
    this._xhr = xhr;
    xhr.responseType = this.responseType;
    xhr.withCredentials = this.options.withCredentials;
    const _headers = { ...this.headers, ...headers };
    Object.keys(_headers).forEach(key => xhr.setRequestHeader(key, _headers[key]));
  }

  private getResponseBody(xhr: XMLHttpRequest): string | object {
    let body = 'response' in (xhr as any) ? xhr.response : xhr.responseText;
    if (this.responseType === 'json' && body && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }

  private processResponse(xhr: XMLHttpRequest): void {
    this.response = this.getResponseBody(xhr);
    this.responseStatus = xhr.status === 0 && this.response ? 200 : xhr.status;
    this.statusType = (xhr.status - (this.responseStatus % 100)) as any;
  }

  private onProgress(chunkSize: number) {
    return (evt: ProgressEvent) => {
      const uploaded = evt.lengthComputable
        ? this.offset + chunkSize * (evt.loaded / evt.total)
        : this.offset;
      this.progress = +((uploaded / this.size) * 100).toFixed(2);
      const now = new Date().getTime();
      this.speed = Math.round((uploaded / (now - this.startTime)) * 1000);
      this.remaining = Math.ceil((this.size - uploaded) / this.speed);
      this.notifyState();
    };
  }

  private waitForRetry(): Promise<number> {
    this.status = 'retry';
    return this.retry.wait(this.responseStatus);
  }
}
