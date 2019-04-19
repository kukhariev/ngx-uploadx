import { BackoffRetry } from './backoff_retry';
import { UploadItem, UploadxOptions, UploadState, UploadStatus } from './interfaces';
import { unfunc } from './utils';
const noop = () => {};

/**
 * Uploader Base Class
 */
export abstract class Uploader {
  /**
   * The name of the file
   */
  readonly name: string;
  /**
   * The size of the file in bytes
   */
  readonly size: number;
  /**
   * The MIME type
   */
  readonly mimeType: string;
  readonly uploadId = Math.random()
    .toString(36)
    .substring(2, 15);
  /**
   * Last request response code
   */
  responseStatus: number;
  /**
   * Upload start time
   * @internal
   */
  protected startTime: number;
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
   * file URI
   */
  URI: string;
  /**
   * Custom headers
   */
  headers: { [key: string]: string } | null;
  /**
   * Metadata/Fingerprint Object
   */
  metadata: { [key: string]: any };
  /**
   * API endpoint
   */
  endpoint = '/upload';
  /**
   * Maximum number of retries to allow (client errors (4xx))
   */
  protected maxRetryAttempts = 3;
  /**
   * Retries handler
   * @internal
   */
  protected retry = new BackoffRetry();
  /**
   * Last response body
   */
  response: any;
  /**
   * Last response status type
   * @internal
   */
  protected statusType: 200 | 300 | 400 | 500;
  /**
   * Chunk size in bytes
   */
  chunkSize: number;
  /**
   * Auth Bearer token / token Getter
   */
  token: string | (() => string);
  /**
   * Status  of uploader
   * @internal
   */
  private _status: UploadStatus;
  /**
   * API responseType
   */
  protected responseType: XMLHttpRequestResponseType = '';
  /**
   * Events emiter
   */
  private stateChange: (evt: UploadState) => void;
  /**
   * Active XMLHttpRequest
   * @internal
   */
  protected _xhr_: XMLHttpRequest;
  /**
   * Next chunk offset
   * @internal
   */
  protected offset = 0;

  constructor(readonly file: File, public options: UploadxOptions) {
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.stateChange = options.stateChange || noop;
    this.configure(options);
  }
  /**
   * Upload status
   */
  set status(s: UploadStatus) {
    // Return if State is cancelled or complete
    // (but allow cancel of an complete upload to remove from list and from server)
    if (this._status === 'cancelled' || (this._status === 'complete' && s !== 'cancelled')) {
      return;
    }
    if (s !== this._status) {
      if (this._xhr_ && (s === 'cancelled' || s === 'paused')) {
        this._xhr_.abort();
      }
      if (s === 'cancelled' && this.URI) {
        this.request({ method: 'delete' });
      }
      this._status = s;
      this.notifyState();
    }
  }
  get status() {
    return this._status;
  }

  /**
   * Initiate upload
   */
  async upload(item?: UploadItem | undefined): Promise<void> {
    if (item) {
      this.configure(item);
    }
    if (this.status === 'cancelled' || this.status === 'complete' || this.status === 'paused') {
      return;
    }
    this.status = 'uploading';
    this.refreshToken();
    try {
      const _ = await this.create();
      this.retry.reset();
      this.startTime = new Date().getTime();
      this.start();
    } catch (e) {
      if (this.isMaxAttemptsReached) {
        this.status = 'error';
      } else {
        this.status = 'retry';
        await this.retry.wait(this.responseStatus);
        this.status = 'queue';
      }
    }
  }

  /**
   * Get & set URI
   * @internal
   */
  protected abstract create(): Promise<void>;
  /**
   * Start uploading
   * @internal
   */
  protected abstract sendChunk(): void;
  /**
   * Get & set offset
   * @internal
   */
  protected abstract resume(): void;
  /**
   * Emit current state
   */

  protected notifyState(): void {
    const state: UploadState = {
      file: this.file,
      name: this.name,
      progress: this.progress,
      percentage: this.progress,
      remaining: this.remaining,
      response: this.response,
      responseStatus: this.responseStatus,
      size: this.size,
      speed: this.speed,
      status: this.status,
      uploadId: this.uploadId,
      URI: this.URI
    };

    this.stateChange(state);
  }

  /**
   *  Return key value from response
   */
  protected getKeyFromResponse(key: string) {
    return this._xhr_.getResponseHeader(key);
  }

  /**
   * Set auth token
   */
  refreshToken(token?: any): void {
    this.token = token || this.token;
    if (this.token) {
      const _token = unfunc(this.token);
      this.headers = { ...this.headers, ...{ Authorization: `Bearer ${_token}` } };
    }
  }

  /**
   * Configure or Reconfigure uploader
   */
  configure(item = {} as UploadItem): void {
    const { metadata, headers, token, endpoint } = item;
    this.metadata = {
      name: this.name,
      mimeType: this.mimeType,
      size: this.size,
      lastModified: this.file.lastModified,
      ...unfunc(metadata || this.metadata, this.file)
    };
    this.endpoint = endpoint || this.endpoint;
    this.headers = { ...this.headers, ...unfunc(headers, this.file) };
    this.refreshToken(token);
  }

  /**
   * Start file chunks uploading
   */
  async start() {
    while (this.status === 'uploading' || this.status === 'retry') {
      try {
        const _ = isNaN(this.offset) ? await this.resume() : await this.sendChunk();
        this.retry.reset();
      } catch {
        this.offset = undefined;
        if (this.isMaxAttemptsReached) {
          this.status = 'error';
          break;
        }
        if (this.responseStatus === 404) {
          this.status = 'queue';
          break;
        }
        this.status = 'retry';
        const _ = await this.retry.wait(this.responseStatus);
        this.status = 'uploading';
      }
    }
  }

  /**
   * Request  method
   * @returns status code
   * @internal
   */
  protected request({
    method,
    body = null,
    url,
    headers = {},
    progress = false
  }: {
    method: string;
    body?: any;
    url?: string;
    headers?: any;
    progress?: boolean;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open(method.toUpperCase(), url || this.URI, true);
      if (progress && body) {
        xhr.upload.onprogress = this.setupProgressEvent((body as Blob).size);
      }
      this.setupXhr(xhr, headers);
      xhr.onload = () => {
        this.processResponse(xhr);
        this.statusType > 300 ? reject(this.responseStatus) : resolve(this.responseStatus);
      };
      xhr.onerror = () => {
        this.resetResponse();
        reject(this.responseStatus);
      };
      xhr.send(body);
    });
  }
  private setupXhr(xhr: XMLHttpRequest, headers?: any) {
    this._xhr_ = xhr;
    xhr.responseType = this.responseType;
    xhr.withCredentials = this.options.withCredentials;
    const _headers = { ...this.headers, ...headers };
    Object.keys(_headers).forEach(key => xhr.setRequestHeader(key, _headers[key]));
  }

  private resetResponse() {
    this.responseStatus = undefined;
    this.response = undefined;
    this.statusType = undefined;
  }

  /**
   * Gets whether exceed the maxium number of retries
   */
  private get isMaxAttemptsReached(): boolean {
    return this.retry.retryAttempts === this.maxRetryAttempts && this.statusType === 400;
  }

  private parseXhrResponse(xhr: XMLHttpRequest) {
    let body = 'response' in (xhr as any) ? xhr.response : xhr.responseText;
    if (this.responseType === 'json' && body && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }

  private processResponse(xhr: XMLHttpRequest): void {
    this.response = this.parseXhrResponse(xhr);
    this.responseStatus = xhr.status;
    if (xhr.status === 0 && this.response) {
      this.responseStatus = 200;
    }
    this.statusType = (xhr.status - (this.responseStatus % 100)) as any;
  }

  private setupProgressEvent(chunkSize: number) {
    return (pEvent: ProgressEvent) => {
      const offset = this.offset;
      const uploaded = pEvent.lengthComputable
        ? offset + chunkSize * (pEvent.loaded / pEvent.total)
        : offset;
      this.progress = +((uploaded / this.size) * 100).toFixed(2);
      const now = new Date().getTime();
      this.speed = Math.round((uploaded / (now - this.startTime)) * 1000);
      this.remaining = Math.ceil((this.size - uploaded) / this.speed);
      this.notifyState();
    };
  }
}
