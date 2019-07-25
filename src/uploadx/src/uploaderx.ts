import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { resolveUrl } from './utils';
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
    const location = this.statusType === 200 && this.getValueFromResponse('location');
    if (!location) {
      throw new Error('Invalid or missing Location header');
    }
    this.offset = this.responseStatus === 201 ? 0 : undefined;
    return resolveUrl(location, this.endpoint);
  }

  async sendFileContent(): Promise<number> {
    const end = this.chunkSize ? Math.min(this.offset + this.chunkSize, this.size) : this.size;
    const body = this.file.slice(this.offset, end);
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    const _ = await this.request({
      method: 'PUT',
      body,
      url: this.url,
      headers,
      progress: true
    });
    return this.getOffsetFromResponse();
  }

  async getOffset(): Promise<number> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    const _ = await this.request({ method: 'PUT', url: this.url, headers });
    return this.getOffsetFromResponse();
  }

  protected getOffsetFromResponse(): number {
    if (this.responseStatus > 201) {
      const range = this.getValueFromResponse('Range');
      return getRangeEnd(range) + 1;
    }
    if (this.statusType === 200) {
      return this.size;
    }
  }

  protected onCancel(): void {
    this.url && this.request({ method: 'DELETE' });
  }

  protected setAuth(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
  }
}

export function getRangeEnd(range = ''): number {
  const end = +range.split(/0-/)[1];
  return end >= 0 ? end : -1;
}
