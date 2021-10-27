import { Uploader } from './uploader';
import { resolveUrl } from './utils';

/**
 * Implements XHR/CORS Resumable Upload
 *
 * {@link https://github.com/kukhariev/node-uploadx/blob/master/proto.md|Github}
 * @see {@link https://developers.google.com/drive/api/v3/manage-uploads#resumable|Google Drive API documentation}
 */
export class UploaderX extends Uploader {
  responseType = 'json' as 'json';

  async getFileUrl(): Promise<string> {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Upload-Content-Length': this.size.toString(),
      'X-Upload-Content-Type': this.file.type || 'application/octet-stream'
    };
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
    this.offset = this.getOffsetFromResponse() || (this.responseStatus === 201 ? 0 : undefined);
    return resolveUrl(location, this.endpoint);
  }

  async sendFileContent(): Promise<number | undefined> {
    const { end, body } = this.getChunk();
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    await this.request({ method: 'PUT', body, headers });
    return this.responseStatus > 201 ? this.getOffsetFromResponse() : this.size;
  }

  async getOffset(): Promise<number | undefined> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    await this.request({ method: 'PUT', headers });
    return this.responseStatus > 201 ? this.getOffsetFromResponse() : this.size;
  }

  protected getOffsetFromResponse(): number | undefined {
    const range = this.getValueFromResponse('Range');
    return range ? getRangeEnd(range) + 1 : undefined;
  }
}

export function getRangeEnd(range = ''): number {
  const end = parseInt(range.split(/-/)[1], 10);
  return end >= 0 ? end : -1;
}
