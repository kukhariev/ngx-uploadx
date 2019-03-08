/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/v3/web/resumable-upload
 */

import { resolveUrl } from './resolve_url';
import { BackoffRetry } from './backoffRetry';
import { UploadStatus, UploadItem, UploaderOptions, UploadState } from './interfaces';

export class Uploader implements UploaderOptions {
  headers: { [key: string]: string } | null;
  metadata: { [key: string]: any };
  private _status: UploadStatus;
  private abort: () => void;
  private retry: BackoffRetry;
  private startTime: number;
  progress: number;
  readonly mimeType: string;
  readonly name: string;
  readonly size: number;
  readonly uploadId: string;
  remaining: number;
  response: any;
  responseStatus: number;
  speed: number;
  URI: string;
  token: string | (() => string);

  /**
   * Creates an instance of Uploader.
   */
  constructor(private readonly file: File, public options: UploaderOptions) {
    this.uploadId = Math.random()
      .toString(36)
      .substring(2, 15);
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.retry = new BackoffRetry();
    this.configure(options);
  }

  /**
   * configure or reconfigure uploader
   */
  configure(item = {} as UploaderOptions | UploadItem): void {
    const { metadata, headers, token } = item;
    this.metadata = {
      name: this.name,
      mimeType: this.mimeType,
      size: this.size,
      ...unfunc(metadata || this.metadata, this.file)
    };
    this.token = unfunc(token || this.token);
    this.headers = { ...unfunc(headers, this.file), ...this.headers };
  }

  set status(s: UploadStatus) {
    if (this._status === 'cancelled' || this._status === 'complete') {
      return;
    }
    if (s !== this._status) {
      if (this.abort && (s === 'cancelled' || s === 'paused')) {
        this.abort();
      }
      if (s === 'cancelled') {
        this.cancel();
      }
      this._status = s;
      this.notifyState();
    }
  }

  get status() {
    return this._status;
  }

  /**
   * Emit current state
   */
  private notifyState() {
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
      status: this._status,
      uploadId: this.uploadId,
      URI: this.URI
    };
    //
    setTimeout(() => this.options.subj.next(state));
  }

  private create() {
    return new Promise((resolve, reject) => {
      if (!this.URI || this.responseStatus === 404) {
        // get file URI
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open(this.options.method, this.options.endpoint, true);
        xhr.responseType = 'json';
        xhr.withCredentials = this.options.withCredentials;
        this.setCommonHeaders(xhr);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('X-Upload-Content-Length', this.size.toString());
        xhr.setRequestHeader('X-Upload-Content-Type', this.mimeType);
        xhr.onload = () => {
          this.responseStatus = xhr.status;
          this.response = parseJson(xhr);
          if (xhr.status < 400 && xhr.status > 199) {
            const location = getKeyFromResponse(xhr, 'location');
            if (!location) {
              reject(new Error('invalid response: missing location url'));
            } else {
              this.URI = resolveUrl(location, this.options.endpoint);
              resolve();
            }
          } else {
            reject(new Error(`invalid response code: ${this.responseStatus}`));
          }
        };
        xhr.onerror = () => {
          this.status = 'error';
          this.upload();
        };
        xhr.send(JSON.stringify(this.metadata));
      } else {
        resolve();
      }
    });
  }

  /**
   * Initiate upload
   */
  async upload(item?: UploadItem | undefined) {
    if (item) this.configure(item);

    if (this.status === 'error') {
      await this.retry.wait();
    }
    this.status = 'uploading';
    try {
      await this.create();
      this.retry.reset();
      this.startTime = this.startTime || new Date().getTime();
      this.abort = this.sendChunk(this.URI ? undefined : 0);
    } catch (e) {
      this.status = 'error';
      console.error(e);
    }
  }

  /**
   * Content upload
   * @param offset
   */
  private sendChunk(offset?: number) {
    if (this.status === 'uploading') {
      const isValidRange = offset >= 0 && offset < this.size;
      let body = null;
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('PUT', this.URI, true);
      xhr.responseType = 'json';
      xhr.withCredentials = this.options.withCredentials;
      this.setupEvents(xhr);
      if (isValidRange) {
        const { end, chunk }: { end: number; chunk: Blob } = this.sliceFile(offset);
        xhr.upload.onprogress = this.setupProgressEvent(offset, end);
        body = chunk;
        xhr.setRequestHeader('Content-Range', `bytes ${offset}-${end - 1}/${this.size}`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      } else {
        xhr.setRequestHeader('Content-Range', `bytes */${this.size}`);
      }
      this.setCommonHeaders(xhr);
      xhr.send(body);
      return () => xhr.abort();
    }
  }

  private setupEvents(xhr: XMLHttpRequest) {
    const onError = async () => {
      // 5xx errors or network failures
      if (xhr.status > 499 || !xhr.status) {
        await this.retry.wait();
        this.abort = this.sendChunk();
      } else {
        // stop on 4xx errors
        this.response = parseJson(xhr);
        this.status = 'error' as UploadStatus;
      }
    };
    const onSuccess = () => {
      this.responseStatus = xhr.status;
      if (xhr.status === 200 || xhr.status === 201) {
        this.progress = 100;
        this.response = parseJson(xhr);
        this.status = 'complete' as UploadStatus;
      } else if (xhr.status < 400) {
        const range = getRange(xhr);
        this.retry.reset();
        // send next chunk
        this.abort = this.sendChunk(range);
      } else {
        onError();
      }
    };
    xhr.onerror = onError;
    xhr.onload = onSuccess;
  }

  private setupProgressEvent(start: number, end: number) {
    return (pEvent: ProgressEvent) => {
      const uploaded = pEvent.lengthComputable
        ? start + (end - start) * (pEvent.loaded / pEvent.total)
        : start;
      this.progress = +((uploaded / this.size) * 100).toFixed(2);
      const now = new Date().getTime();
      this.speed = Math.round((uploaded / (now - this.startTime)) * 1000);
      this.remaining = Math.ceil((this.size - uploaded) / this.speed);
      this.notifyState();
    };
  }

  private sliceFile(start: number) {
    const end = this.options.chunkSize
      ? Math.min(start + this.options.chunkSize, this.size)
      : this.size;
    const chunk: Blob = this.file.slice(start, end);
    return { end, chunk };
  }

  private setCommonHeaders(xhr: XMLHttpRequest) {
    Object.keys(this.headers).forEach(key => xhr.setRequestHeader(key, this.headers[key]));
    // tslint:disable-next-line: no-unused-expression
    this.token && xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
  }

  private cancel() {
    return new Promise((resolve, reject) => {
      if (this.URI) {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('DELETE', this.URI, true);
        xhr.responseType = 'json';
        xhr.withCredentials = this.options.withCredentials;
        this.setCommonHeaders(xhr);
        xhr.onload = () => {
          this.responseStatus = xhr.status;
          this.response = parseJson(xhr);
          resolve();
        };
        xhr.send();
      } else {
        resolve();
      }
    });
  }
}

function getRange(xhr: XMLHttpRequest) {
  const match = getKeyFromResponse(xhr, 'Range').match(/(-1|\d+)$/g);
  return 1 + +(match && match[0]);
}

function getKeyFromResponse(xhr: XMLHttpRequest, key: string) {
  const fromHeader = xhr.getResponseHeader(key);
  if (fromHeader) {
    return fromHeader;
  }
  const response = parseJson(xhr);
  const resKey = Object.keys(response).find(k => k.toLowerCase() === key.toLowerCase());
  return response[resKey];
}

function parseJson(xhr: XMLHttpRequest) {
  return typeof xhr.response === 'object' ? xhr.response : JSON.parse(xhr.responseText || null);
}

function unfunc<T>(value: T | ((file: File) => T), file?: File): T {
  return value instanceof Function ? value(file) : value;
}
