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

  create(): Promise<any> {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': `${this.size}`,
      'X-Upload-Content-Type': `${this.mimeType}`
    };
    const payload = JSON.stringify(this.metadata);
    return this.request({
      method: 'POST',
      payload,
      url: this.endpoint,
      headers
    }).then(_ => {
      const location = this.statusType === 200 && this.getKeyFromResponse(this._xhr_, 'location');
      this.URI = resolveUrl(location, this.endpoint);
      this.retry.reset();
    });
  }
  sendChunk(offset: number): Promise<any> {
    const end = this.chunkSize ? Math.min(offset + this.chunkSize, this.size) : this.size;
    const payload = this.file.slice(offset, end);
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${offset}-${end - 1}/${this.size}`
    };

    return this.request({ method: 'PUT', payload, url: this.URI, headers, progress: true }).then(
      _ => {
        this.retry.reset();
        if (this.statusType === 200) {
          this.progress = 100;
          this.status = 'complete';
        }
      }
    );
  }
  resume(): Promise<any> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    return this.request({ method: 'PUT', url: this.URI, headers }).then(_ => {
      this.retry.reset();
      if (this.statusType === 200) {
        this.progress = 100;
        this.status = 'complete';
      }
    });
  }
  /**
   * Chunk upload +/ get offset
   * @internal
   */

  getNextChunkOffset(xhr: XMLHttpRequest) {
    if (this.statusType === 300) {
      const str = this.getKeyFromResponse(xhr, 'Range');
      const [match] = str && str.match(/(-1|\d+)$/g);
      return match && +match + 1;
    }
  }
}
