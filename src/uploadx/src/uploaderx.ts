import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { resolveUrl } from './utils';

/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/v3/web/resumable-upload
 */
export class UploaderX extends Uploader {
  chunkSize = 1_048_576;
  constructor(readonly file: File, options: UploadxOptions) {
    super(file, options);
    this.responseType = 'json' as XMLHttpRequestResponseType;
  }

  /**
   * Get & set URI
   * @internal
   */
  async create(): Promise<any> {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': `${this.size}`,
      'X-Upload-Content-Type': `${this.mimeType}`
    };
    const body = JSON.stringify(this.metadata);
    const _ = await this.request({
      method: 'POST',
      body,
      url: this.endpoint,
      headers
    });
    const location = this.statusType === 200 && this.getKeyFromResponse('location');
    this.URI = resolveUrl(location, this.endpoint);
    this.offset = this.responseStatus === 201 ? 0 : undefined;
  }
  /**
   * Upload chunk & set new offset
   * @internal
   */
  async sendChunk(): Promise<void> {
    const end = this.chunkSize ? Math.min(this.offset + this.chunkSize, this.size) : this.size;
    const body = this.file.slice(this.offset, end);
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    const _ = await this.request({
      method: 'PUT',
      body,
      url: this.URI,
      headers,
      progress: true
    });
    this.offset = this.getOffset();
  }
  /**
   * Get & set offset
   * @internal
   */
  async resume(): Promise<void> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    const _ = await this.request({ method: 'PUT', url: this.URI, headers });
    this.offset = this.getOffset();
  }
  /**
   * Return next chunk offset or complete upload
   */
  private getOffset() {
    if (this.statusType === 300) {
      const str = this.getKeyFromResponse('Range');
      const [match] = str && str.match(/(-1|\d+)$/g);
      return match && +match + 1;
    } else if (this.statusType === 200) {
      this.progress = 100;
      this.status = 'complete';
      return this.size;
    }
    return;
  }
}
