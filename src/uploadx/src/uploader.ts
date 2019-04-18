import { BackoffRetry } from './backoff_retry';
import { UploadItem, UploadxOptions, UploadState, UploadStatus } from './interfaces';
import { unfunc } from './utils';
const noop = () => {};

export abstract class Uploader {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly uploadId = Math.random()
    .toString(36)
    .substring(2, 15);
  responseStatus: number;
  protected startTime: number;
  progress: number;
  remaining: number;
  speed: number;
  URI: string;
  headers: { [key: string]: string } | null;
  metadata: { [key: string]: any };
  endpoint = '/upload';
  protected maxRetryAttempts = 3;
  protected retry = new BackoffRetry();
  response: any;
  statusType: number;
  chunkSize: number;
  token: string | (() => string);
  private _status: UploadStatus;
  protected responseType: XMLHttpRequestResponseType = '';
  private stateChange: (evt: UploadState) => void;
  protected _xhr_: XMLHttpRequest;
  offset: number;
  constructor(readonly file: File, public options: UploadxOptions) {
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.stateChange = options.stateChange || noop;
    this.configure(options);
  }

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
      await this.create();
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
  protected abstract create(): Promise<void>;
  protected abstract sendChunk(offset?: number): void;
  protected abstract resume(): void;
  protected abstract getNextChunkOffset(xhr: XMLHttpRequest): number;
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
  refreshToken(token?: any): void {
    this.token = token || this.token;
    if (this.token) {
      const _token = unfunc(this.token);
      this.headers = { ...this.headers, ...{ Authorization: `Bearer ${_token}` } };
    }
  }
  /**
   * configure or reconfigure uploader
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

  protected setupXHR(xhr: XMLHttpRequest, headers?: any) {
    this._xhr_ = xhr;
    xhr.responseType = this.responseType;
    xhr.withCredentials = this.options.withCredentials;
    const _headers = { ...this.headers, ...headers };
    Object.keys(_headers).forEach(key => xhr.setRequestHeader(key, _headers[key]));
  }
  private resetResponse() {
    this.responseStatus = null;
    this.response = null;
    this.statusType = null;
  }

  private get isMaxAttemptsReached(): boolean {
    return this.retry.retryAttempts === this.maxRetryAttempts && this.statusType === 400;
  }
  protected parseJson(xhr: XMLHttpRequest) {
    let body = 'response' in (xhr as any) ? xhr.response : xhr.responseText;
    if (this.responseType === 'json' && body && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }

  protected getKeyFromResponse(xhr: XMLHttpRequest, key: string) {
    return xhr.getResponseHeader(key);
  }

  protected request({
    method,
    payload = null,
    url,
    headers = {},
    progress = false
  }: {
    method: string;
    payload?: any;
    url?: string;
    headers?: any;
    progress?: boolean;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open(method.toUpperCase(), url || this.URI, true);
      if (progress && payload) {
        xhr.upload.onprogress = this.setupProgressEvent((payload as Blob).size);
      }
      this.setupXHR(xhr, headers);
      xhr.onload = () => {
        this.processResponse(xhr);
        this.statusType > 300 ? reject(this.responseStatus) : resolve(this.responseStatus);
      };
      xhr.onerror = () => {
        this.resetResponse();
        reject(this.responseStatus);
      };
      xhr.send(payload);
    });
  }

  async start() {
    this.offset = undefined;
    while (this.status === 'uploading' || this.status === 'retry') {
      try {
        if (isNaN(this.offset)) {
          const _ = await this.resume();
        } else {
          const _ = await this.sendChunk(this.offset);
        }
        this.offset = this.getNextChunkOffset(this._xhr_);
      } catch {
        if (this.isMaxAttemptsReached) {
          this.status = 'error';
          break;
        }
        this.status = 'retry';
        this.offset = undefined;
        const _ = await this.retry.wait(this.responseStatus);
        this.status = 'uploading';
      }
    }
  }
  protected processResponse(xhr: XMLHttpRequest): void {
    this.response = this.parseJson(xhr);
    this.responseStatus = xhr.status;
    if (xhr.status === 0) {
      this.responseStatus = this.response ? 200 : 0;
    }
    this.statusType = xhr.status - (this.responseStatus % 100);
  }

  protected setupProgressEvent(chunkSize: number) {
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
