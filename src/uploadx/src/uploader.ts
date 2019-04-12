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
  private _xhr_: XMLHttpRequest;
  constructor(readonly file: File, public options: UploadxOptions) {
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.stateChange = options.stateChange || noop;
    this.configure(options);
  }

  set status(s: UploadStatus) {
    // Return if State is cancelled or complete (but allow cancel of an complete upload to remove from list and from server)
    if (this._status === 'cancelled' || (this._status === 'complete' && s !== 'cancelled')) {
      return;
    }
    if (s !== this._status) {
      if (this._xhr_ && (s === 'cancelled' || s === 'paused')) {
        this._xhr_.abort();
      }
      if (s === 'cancelled' && this.URI) {
        this.request('delete');
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
    if (item) this.configure(item);
    if (this.status === 'cancelled' || this.status === 'complete' || this.status === 'paused') {
      return;
    }
    this.status = 'uploading';
    this.refreshToken();
    try {
      await this.create();
      this.startTime = new Date().getTime();
      this.sendChunk(this.progress ? undefined : 0);
    } catch (e) {
      if (this.isMaxAttemptsReached()) {
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

  protected setupXHR(xhr: XMLHttpRequest) {
    this.responseStatus = null;
    this.response = null;
    this.statusType = null;
    this._xhr_ = xhr;
    xhr.responseType = this.responseType;
    xhr.withCredentials = this.options.withCredentials;
    Object.keys(this.headers).forEach(key => xhr.setRequestHeader(key, this.headers[key]));
  }
  protected isMaxAttemptsReached(): boolean | never {
    if (this.retry.retryAttempts === this.maxRetryAttempts && this.statusType === 400) {
      this.retry.reset();
      console.error(
        `Error: Maximum number of retry attempts reached:
          file: ${this.name},
          statusCode: ${this.responseStatus}`
      );
      return true;
    }
  }
  protected parseJson(xhr: XMLHttpRequest) {
    return typeof xhr.response === 'object' ? xhr.response : JSON.parse(xhr.responseText || null);
  }

  protected getKeyFromResponse(xhr: XMLHttpRequest, key: string) {
    const fromHeader = xhr.getResponseHeader(key);
    if (fromHeader) {
      return fromHeader;
    }
    const response = this.parseJson(xhr) || {};
    const resKey = Object.keys(response).find(k => k.toLowerCase() === key.toLowerCase());
    return response[resKey];
  }

  private request(method: string, payload = null) {
    return new Promise((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open(method.toUpperCase(), this.URI, true);
      this.setupXHR(xhr);
      xhr.onload = () => {
        this.processResponse(xhr);
        resolve();
      };
      xhr.onerror = () => reject();
      const body = payload ? JSON.stringify(payload) : null;
      xhr.send(body);
    });
  }

  protected processResponse(xhr: XMLHttpRequest): void {
    this.responseStatus = xhr.status;
    this.response = this.parseJson(xhr);
    this.statusType = xhr.status - (xhr.status % 100);
  }
  protected setupEvents(xhr: XMLHttpRequest): void {
    const onError = async () => {
      if (this.isMaxAttemptsReached()) {
        this.status = 'error';
        return;
      }
      this.status = 'retry';
      await this.retry.wait(xhr.status);
      if (xhr.status === 404) {
        this.status = 'queue';
        return;
      }
      if (xhr.status === 413) {
        this.chunkSize /= 2;
      }
      this.refreshToken();
      this.status = 'uploading';
      // request offset
      this.sendChunk();
    };
    const onSuccess = () => {
      this.processResponse(xhr);
      const offset = this.getNextChunkOffset(xhr);
      if (typeof offset === 'number') {
        //  next chunk
        this.retry.reset();
        this.sendChunk(offset);
      } else if (this.statusType === 200) {
        this.progress = 100;
        this.status = 'complete';
      } else {
        onError();
      }
    };
    xhr.onerror = onError;
    xhr.onload = onSuccess;
  }
  protected setupProgressEvent(offset: number, end: number) {
    return (pEvent: ProgressEvent) => {
      const uploaded = pEvent.lengthComputable
        ? offset + (end - offset) * (pEvent.loaded / pEvent.total)
        : offset;
      this.progress = +((uploaded / this.size) * 100).toFixed(2);
      const now = new Date().getTime();
      this.speed = Math.round((uploaded / (now - this.startTime)) * 1000);
      this.remaining = Math.ceil((this.size - uploaded) / this.speed);
      this.notifyState();
    };
  }
}
