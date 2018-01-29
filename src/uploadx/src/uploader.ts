import { Subject } from 'rxjs/Subject';

import { BackoffRetry } from './backoffRetry';
import { XHRFactory } from './xhrfactory';
import {
  UploadStatus,
  UploadItem,
  UploaderOptions,
  UploadState
} from './interfaces';

const noop = () => { };
/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/v3/web/resumable-upload
 * https://developer.vimeo.com/api/upload/videos#resumable-upload
 * @class Uploader
 */
export class Uploader implements UploaderOptions {
  headers: any;
  metadata: any;
  method: string;
  mimeType: string;
  name: string;
  progress: number;
  remaining: number;
  response: any;
  size: number;
  speed: number;
  uploadId: string;
  url: any;
  private startTime: number;
  private _status: UploadStatus;
  private retry: BackoffRetry;
  private abort;
  /**
   * Creates an instance of Uploader.
   */
  constructor(private file: File, private options: UploaderOptions) {
    this.uploadId = Math.random().toString(36).substring(2, 15);
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
    this.status = 'added';
    this.retry = new BackoffRetry();
  }
  /**
   * Set individual file options and add to queue
   */
  configure(item?: UploadItem) {
    if (this.status === 'added') {
      this.metadata = Object.assign(
        { name: this.name, mimeType: this.mimeType },
        this.options.metadata || {});
      this.headers = (this.options.headers instanceof Function)
        ? this.options.headers(this.file)
        : this.options.headers;
      this.url = this.options.url;
      this.method = this.options.method;
    }
    this.status = 'queue';
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
   * Emit UploadState
   */
  private notifyState() {
    const state: UploadState = {
      file: this.file,
      name: this.name,
      progress: this.progress,
      remaining: this.remaining,
      response: this.response,
      size: this.size,
      speed: this.speed,
      status: this._status,
      uploadId: this.uploadId,
    };
    // tick for control events detect
    setTimeout(() => {
      this.options.subj.next(state);
    });
  }

  private setHeaders(xhr: XMLHttpRequest) {
    if (this.headers) {
      Object.keys(this.headers)
        .forEach(key => xhr.setRequestHeader(key, this.headers[key]));
    }
  }

  /**
   * Initiate upload
   */
  upload() {
    if (this.status === 'added') {
      this.configure();
    }
    this.status = 'uploading';
    if (this.progress > 0) {
      return this.resume();
    }
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open(this.method, this.options.url, true);
    if (!!this.options.withCredentials) {
      xhr.withCredentials = true;
    }
    this.setHeaders(xhr);
    this.options.token
      ? xhr.setRequestHeader('Authorization', 'Bearer ' + this.options.token)
      : noop();
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.setRequestHeader('X-Upload-Content-Length', this.size.toString());
    xhr.setRequestHeader('X-Upload-Content-Type', this.mimeType);
    xhr.onload = () => {
      if (xhr.status < 400 && xhr.status > 199) {
        // get secure upload link
        this.url = xhr.getResponseHeader('Location');
        this.startTime = this.startTime || new Date().getTime();
        this.sendFile();
      } else {
        this.response = xhr.response;
        this.status = 'error';
      }
    };
    xhr.send(JSON.stringify(this.metadata));
  }
  /**
   * Request upload state after 5xx errors or network failures
   */
  private resume(): void {
    const xhr: XMLHttpRequest = XHRFactory.getInstance();
    if (xhr.responseType !== 'json') {
      xhr.responseType = 'json';
    }
    xhr.open('PUT', this.url, true);
    if (!!this.options.withCredentials) {
      xhr.withCredentials = true;
    }
    xhr.setRequestHeader('Content-Range', `bytes */${this.size}`);
    xhr.setRequestHeader('Content-Type', this.mimeType);
    this.setHeaders(xhr);
    const onDataSendError = () => {
      // 5xx errors or network failures
      if (xhr.status > 499 || !xhr.status) {
        XHRFactory.release(xhr);
        this.retry.wait()
          .then(() => this.resume());
      } else {
        // 4xx errors
        this.response = xhr.response || {
          'error': {
            'code': xhr.status,
            'message': xhr.statusText
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
        this.response = xhr.response;
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
   *
   * Content upload
   * @private
   */
  private sendFile(start: number = 0): () => void {
    if (this.status === 'cancelled' || this.status === 'paused') {
      return;
    }
    let end: number = (this.options.chunkSize) ? start + this.options.chunkSize : this.size;
    end = (end > this.size) ? this.size : end;
    const chunk: Blob = this.file.slice(start, end);
    const xhr: XMLHttpRequest = XHRFactory.getInstance();
    if (xhr.responseType !== 'json') {
      xhr.responseType = 'json';
    }

    xhr.open('PUT', this.url, true);
    if (!!this.options.withCredentials) {
      xhr.withCredentials = true;
    }
    xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${this.size}`);
    xhr.setRequestHeader('Content-Type', this.mimeType);
    this.setHeaders(xhr);
    const updateProgress = (pEvent: ProgressEvent) => {
      const uploaded = pEvent.lengthComputable
        ? start + (end - start) * (pEvent.loaded / pEvent.total)
        : start;
      this.progress = +((uploaded / this.size) * 100).toFixed(2);
      const now = new Date().getTime();
      this.speed = Math.round(uploaded / (now - this.startTime) * 1000);
      this.remaining = Math.ceil((this.size - uploaded) / this.speed);
      this.notifyState();
    };
    const onDataSendError = () => {
      // 5xx errors or network failures
      if (xhr.status > 499 || !xhr.status) {
        XHRFactory.release(xhr);
        this.retry.wait()
          .then(() => this.resume());
      } else {
        // 4xx errors
        this.response = xhr.response || {
          'error': {
            'code': +xhr.status,
            'message': xhr.statusText
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
    };
    xhr.onerror = onDataSendError;
    xhr.onload = onDataSendSuccess;
    xhr.upload.onprogress = updateProgress;
    xhr.send(chunk);
    return () => { xhr.abort(); };
  }
}
