/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/v3/web/resumable-upload
 */

import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { resolveUrl } from './utils';

export class UploaderX extends Uploader {
  chunkSize = 1_048_576;
  /**
   * Creates an instance of Uploader.
   */
  constructor(readonly file: File, options: UploadxOptions) {
    super(file, options);
    this.responseType = 'json' as XMLHttpRequestResponseType;
  }

  create(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.URI || this.responseStatus === 404) {
        // get file URI
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('POST', this.endpoint, true);
        this.setupXHR(xhr);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('X-Upload-Content-Length', this.size.toString());
        xhr.setRequestHeader('X-Upload-Content-Type', this.mimeType);
        xhr.onload = () => {
          this.processResponse(xhr);
          const location = this.statusType === 200 && this.getKeyFromResponse(xhr, 'location');
          if (!location) {
            // limit attempts
            this.statusType = 400;
            reject();
          } else {
            this.URI = resolveUrl(location, this.endpoint);
            this.retry.reset();
            resolve();
          }
        };
        xhr.onerror = () => reject();
        xhr.send(JSON.stringify(this.metadata));
      } else {
        resolve();
      }
    });
  }

  /**
   * Chunk upload +/ get offset
   * @internal
   */
  sendChunk(offset?: number): void {
    if (this.status === 'uploading') {
      let body = null;
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('PUT', this.URI, true);
      this.setupXHR(xhr);
      this.setupEvents(xhr);
      if (offset >= 0 && offset < this.size) {
        const end = this.chunkSize ? Math.min(offset + this.chunkSize, this.size) : this.size;
        body = this.file.slice(offset, end);
        xhr.upload.onprogress = this.setupProgressEvent(offset, end);
        xhr.setRequestHeader('Content-Range', `bytes ${offset}-${end - 1}/${this.size}`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      } else {
        xhr.setRequestHeader('Content-Range', `bytes */${this.size}`);
      }
      xhr.send(body);
    }
  }

  getNextChunkOffset(xhr: XMLHttpRequest) {
    if (this.statusType === 300) {
      const str = this.getKeyFromResponse(xhr, 'Range');
      const [match] = str && str.match(/(-1|\d+)$/g);
      return match && +match + 1;
    }
  }
}
