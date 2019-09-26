import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { isString, resolveUrl } from './utils';
/**
 * Implements XHR/CORS Resumable Upload
 * @see
 * https://developers.google.com/drive/api/v3/manage-uploads#resumable
 */
export class UploaderX extends Uploader {
  constructor(readonly file: File, options: UploadxOptions) {
    super(file, options);
    this.responseType = 'json' as XMLHttpRequestResponseType;
  }

  async getFileUrl(): Promise<string> {
    if (this.url) {
      this.offset = undefined;
      return this.url;
    }
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    } as any;
    if (this.file.size) {
      headers['X-Upload-Content-Length'] = this.file.size;
    }
    if (this.file.type) {
      headers['X-Upload-Content-Type'] = this.file.type;
    }
    await this.request({
      method: 'POST',
      body: JSON.stringify(this.metadata),
      url: this.endpoint,
      headers
    });
    const location = this.getValueFromResponse('location');
    if (!location) {
      throw new Error('Invalid or missing Location header');
    }
    this.offset = this.responseStatus === 201 ? 0 : undefined;
    return resolveUrl(location, this.endpoint);
  }

  async sendFileContent(): Promise<number | undefined> {
    const { end, body } = this.getChunk();
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    await this.request({
      method: 'PUT',
      body,
      headers
    });
    return this.getOffsetFromResponse();
  }

  async getOffset(): Promise<number | undefined> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    await this.request({ method: 'PUT', headers });
    return this.getOffsetFromResponse();
  }

  protected getOffsetFromResponse(): number | undefined {
    if (this.responseStatus > 201) {
      const range = this.getValueFromResponse('Range');
      return isString(range) ? getRangeEnd(range) + 1 : undefined;
    }
    if (this.responseStatus <= 201) {
      return this.size;
    }
  }
}

export function getRangeEnd(range = ''): number {
  const end = +range.split(/0-/)[1];
  return end >= 0 ? end : -1;
}
