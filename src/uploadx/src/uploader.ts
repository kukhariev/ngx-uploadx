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
  headers: { [key: string]: string } | null;
  metadata: { [key: string]: any };
  private _status: UploadStatus;
  private abort = noop;
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
    this.status = 'added' as UploadStatus;
    this.retry = new BackoffRetry();
  }

  set status(s: UploadStatus) {
    if (
      this._status === ('cancelled' as UploadStatus) ||
      this._status === ('complete' as UploadStatus)
    ) {
      return;
    }
    if (s !== this._status) {
      this._status = s;
      this.notifyState();
      if (this.abort && (s === ('cancelled' as UploadStatus) || s === ('paused' as UploadStatus))) {
        this.abort();
      }
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
    // tick for control events detect
    setTimeout(() => {
      this.options.subj.next(state);
    });
  }

  /**
   * Set individual file options and add to queue
   */

  create(item: UploadItem = {}) {
    return new Promise((resolve, reject) => {
      if (!this.URI || this.status === ('error' as UploadStatus)) {
        // configure
        const { metadata, headers } = item;
        this.metadata = {
          name: this.name,
          mimeType: this.mimeType,
          size: this.size,
          ...unfunc(this.options.metadata, this.file),
          ...unfunc(metadata, this.file)
        };

        this.headers = unfunc(headers, this.file);

        // get file URI
        const xhr = new XMLHttpRequest();
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
              this.status = 'error' as UploadStatus;
              reject(this);
            } else {
              this.URI = resolveUrl(location, this.options.endpoint);
              this.status = 'uploading' as UploadStatus;
              resolve(this);
            }
          } else {
            this.status = 'error' as UploadStatus;
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
    this.status = 'uploading' as UploadStatus;
    try {
      await this.create(item);
      if (this.progress) {
        this.abort = this.sendChunk();
      } else {
        this.startTime = this.startTime || new Date().getTime();
        this.abort = this.sendChunk(0);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Content upload
   */
  private sendChunk(start?: number) {
    if (
      this.status === ('cancelled' as UploadStatus) ||
      this.status === ('paused' as UploadStatus)
    ) {
      return;
    }
    const isValidRange = typeof start === 'number';
    let body = null;
    const xhr: XMLHttpRequest = XHRFactory.getInstance();
    xhr.open('PUT', this.URI, true);
    xhr.responseType = 'json';
    xhr.withCredentials = this.options.withCredentials;
    this.setupEvents(xhr);
    if (isValidRange) {
      const { end, chunk }: { end: number; chunk: Blob } = this.sliceFile(start);
      xhr.upload.onprogress = this.setupProgressEvent(start, end);
      body = chunk;
      xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${this.size}`);
    } else {
      xhr.setRequestHeader('Content-Range', `bytes */${this.size}`);
    }
    this.setCommonHeaders(xhr);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(body);
    return () => xhr.abort();
  }

  private setupEvents(xhr: XMLHttpRequest) {
    const onError = async () => {
      this.responseStatus = xhr.status;
      // 5xx errors or network failures
      if (xhr.status > 499 || !xhr.status) {
        XHRFactory.release(xhr);
        await this.retry.wait();
        this.abort = this.sendChunk();
      } else {
        // stop on 4xx errors
        this.response = parseJson(xhr) || {
          error: {
            code: +xhr.status,
            message: xhr.statusText
          }
        };
        XHRFactory.release(xhr);
        this.status = 'error' as UploadStatus;
      }
    };
    const onSuccess = () => {
      this.responseStatus = xhr.status;
      if (xhr.status === 200 || xhr.status === 201) {
        this.progress = 100;
        this.response = parseJson(xhr);
        XHRFactory.release(xhr);
        this.status = 'complete' as UploadStatus;
      } else if (xhr.status < 400) {
        const range = getRange(xhr);
        this.retry.reset();
        XHRFactory.release(xhr);
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
