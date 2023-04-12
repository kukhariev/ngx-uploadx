import { Uploader } from './uploader';
import { resolveUrl } from './utils';

/**
 * Implements XHR/CORS Resumable Upload
 * {@link https://github.com/kukhariev/node-uploadx/blob/master/proto.md Github}
 * @see {@link https://developers.google.com/drive/api/v3/manage-uploads#resumable Google Drive API documentation}
 */
export class UploaderX extends Uploader {
  responseType = 'json' as const;

  async getFileUrl(): Promise<string> {
    const body = JSON.stringify(this.metadata);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Upload-Content-Length': this.size,
      'X-Upload-Content-Type': this.file.type || 'application/octet-stream'
    };
    await this.request({ method: 'POST', body, url: this.endpoint, headers });
    this.offset = this.getOffsetFromResponse() || (this.responseStatus === 201 ? 0 : undefined);
    const location = this.getValueFromResponse('location');
    if (!location) {
      throw new Error('Invalid or missing Location header');
    }
    return resolveUrl(location, this.endpoint);
  }

  async sendFileContent(): Promise<number | undefined> {
    const { body, start, end } = this.getChunk();
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end - 1}/${this.size}`
    };
    await this.request({ method: 'PUT', body, headers });
    return this.responseStatus > 201 ? this.getOffsetFromResponse() : end;
  }

  async getOffset(): Promise<number | undefined> {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes */${this.size}`
    };
    await this.request({ method: 'PUT', headers });
    return this.responseStatus > 201 ? this.getOffsetFromResponse() : this.size;
  }

  async update<T>(data: T): Promise<string> {
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json; charset=utf-8' };
    await this.request({ method: 'PATCH', body, headers });
    const location = this.getValueFromResponse('location') || this.url;
    return resolveUrl(location, this.endpoint);
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
