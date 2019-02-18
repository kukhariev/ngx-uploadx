import { resolveUrl } from './resolve_url';
import { BackoffRetry } from './backoffRetry';
import { XHRFactory } from './xhrfactory';
import { UploadStatus, UploadItem, UploaderOptions, UploadState } from './interfaces';

const noop = () => {};
/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/v3/web/resumable-upload
 */
export class Uploader implements UploaderOptions {
  headers: any;
  metadata: any;
  mimeType: string;
  name: string;
  progress: number;
  remaining: number;
  response: any;
  size: number;
  speed: number;
  uploadId: string;
  URI: string;
  private startTime: number;
  private _status: UploadStatus;
  private retry: BackoffRetry;
  private abort;
  /**
   * Creates an instance of Uploader.
   */
  constructor(private file: File, public options: UploaderOptions) {
    this.uploadId = Math.random()
      .toString(36)
      .substring(2, 15);
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.status = 'added';
    this.retry = new BackoffRetry();
  }
  set status(s: UploadStatus) {
    this._status = s;
    this.notifyState();
    if (s === 'cancelled' || s === 'paused') {
      this.abort();
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
      size: this.size,
      speed: this.speed,
      status: this._status,
      uploadId: this.uploadId,
      URI: this.URI
    };
    // tick for control events detect
    setTimeout(() => {
      this.options.subj.next(state);
    });
  }

  private setCommonHeaders(xhr: XMLHttpRequest) {
    const headers =
      this.options.headers instanceof Function
        ? { ...this.options.headers(this.file), ...this.headers }
        : { ...this.options.headers, ...this.headers };

    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
    const token =
      this.options.token instanceof Function ? this.options.token() : this.options.token;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
  }
  /**
   * Set individual file options and add to queue
   */

  create(item: UploadItem = {}) {
    return new Promise((resolve, reject) => {
      if (this.status === 'added' || this.status === 'error') {
        // configure
        const { metadata, headers } = item;
        this.metadata = {
          name: this.name,
          mimeType: this.mimeType,
          size: this.size,
          ...unfunc(this.options.metadata, this.file),
          ...unfunc(metadata, this.file)
        };

        this.headers = headers instanceof Function ? headers(this.file) : headers;

        // get session
        const xhr = new XMLHttpRequest();
        xhr.open(this.options.method, this.options.url, true);
        xhr.responseType = 'json';
        xhr.withCredentials = this.options.withCredentials;
        this.setCommonHeaders(xhr);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('X-Upload-Content-Length', this.size.toString());
        xhr.setRequestHeader('X-Upload-Content-Type', this.mimeType);
        xhr.onload = () => {
          this.response = parseJson(xhr);
          if (xhr.status < 400 && xhr.status > 199) {
            // get secure upload link
            this.response = xhr.response;
            const location = xhr.getResponseHeader('Location');
            if (!location) {
              this.status = 'error';
              reject(this);
            } else {
              this.URI = resolveUrl(location, this.options.url);
              this.status = 'queue';
              resolve(this);
            }
          } else {
            this.response = xhr.response;
            this.status = 'error';
            reject(this);
          }
        };
        xhr.send(JSON.stringify(this.metadata));
      } else {
        resolve(this);
      }
    });
  }
  /**
   * Initiate upload
   */
  async upload(item?: UploadItem) {
    try {
      await this.create(item);
      this.status = 'uploading';
      if (this.progress > 0) {
        this.resume();
      } else {
        this.startTime = this.startTime || new Date().getTime();
        this.sendFile();
      }
    } catch {}
  }
  /**
   * Request upload state after 5xx errors or network failures
   */
  private resume(): void {
    const xhr: XMLHttpRequest = XHRFactory.getInstance();
    xhr.open('PUT', this.URI, true);
    xhr.responseType = 'json';
    xhr.withCredentials = this.options.withCredentials;
    this.setCommonHeaders(xhr);
    xhr.setRequestHeader('Content-Range', `bytes */${this.size}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    const onDataSendError = async () => {
      // 5xx errors or network failures
      if (xhr.status > 499 || !xhr.status) {
        XHRFactory.release(xhr);
        await this.retry.wait();
        this.resume();
      } else {
        // stop on 4xx errors
        this.response = parseJson(xhr) || {
          error: {
            code: xhr.status,
            message: xhr.statusText
          }
        };
        this.status = 'error';
        XHRFactory.release(xhr);
        this.options.nextFile();
      }
    };
    const onDataSendSuccess = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        this.progress = 100;
        this.response = parseJson(xhr);
        this.status = 'complete';
        XHRFactory.release(xhr);
        this.options.nextFile();
      } else if (xhr.status && xhr.status < 400) {
        const range = +xhr.getResponseHeader('Range').split('-')[1] + 1;
        this.retry.reset();
        XHRFactory.release(xhr);
        this.abort = this.sendFile(range);
      } else {
        onDataSendError();
      }
    };
    xhr.onerror = onDataSendError;
    xhr.onload = onDataSendSuccess;
    xhr.send();
  }
  /**
   * Content upload
   */
  private sendFile(start: number = 0): () => void {
    if (this.status === 'cancelled' || this.status === 'paused') {
      return;
    }
    let end: number = this.options.chunkSize ? start + this.options.chunkSize : this.size;
    end = end > this.size ? this.size : end;
    const chunk: Blob = this.file.slice(start, end);
    const xhr: XMLHttpRequest = XHRFactory.getInstance();
    xhr.open('PUT', this.URI, true);
    xhr.responseType = 'json';
    xhr.withCredentials = this.options.withCredentials;
    this.setCommonHeaders(xhr);
    xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${this.size}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    const updateProgress = (pEvent: ProgressEvent) => {
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
    let end: number = this.options.chunkSize ? start + this.options.chunkSize : this.size;
    end = end > this.size ? this.size : end;
    const chunk: Blob = this.file.slice(start, end);
    return { end, chunk };
  }

  private setCommonHeaders(xhr: XMLHttpRequest) {
    const headers = { ...unfunc(this.options.headers, this.file), ...this.headers };
    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

    const token = unfunc(this.options.token);
    // tslint:disable-next-line: no-unused-expression
    token && xhr.setRequestHeader('Authorization', `Bearer ${token}`);
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
    };
    const onDataSendSuccess = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        this.progress = 100;
        this.response = xhr.response;
        this.status = 'complete';
        XHRFactory.release(xhr);
        this.options.nextFile();
      } else if (xhr.status && xhr.status < 400) {
        const range = +xhr.getResponseHeader('Range').split('-')[1] + 1;
        this.retry.reset();
        XHRFactory.release(xhr);
        // send next chunk
        this.abort = this.sendFile(range);
      } else {
        onDataSendError();
      }

function parseJson(xhr: XMLHttpRequest) {
  return typeof xhr.response === 'object' ? xhr.response : JSON.parse(xhr.responseText || null);
}

function unfunc<T>(value: T | ((...args: any) => T), ...args: any): T {
  return value instanceof Function ? value(...args) : value;
}
