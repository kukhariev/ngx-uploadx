import { Uploader } from './uploader';
import { b64, resolveUrl } from './utils';

/**
 * Implements tus resumable upload protocol
 * {@link https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md  Github}
 */
export class Tus extends Uploader {
  headers = { 'Tus-Resumable': '1.0.0' };

  async getFileUrl(): Promise<string> {
    const encodedMetaData = b64.serialize(this.metadata);
    const headers = {
      'Upload-Length': this.size,
      'Upload-Metadata': encodedMetaData
    };
    await this.request({ method: 'POST', url: this.endpoint, headers });
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
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': start
    };
    await this.request({ method: 'PATCH', body, headers });
    return this.getOffsetFromResponse() || end;
  }

  async getOffset(): Promise<number | undefined> {
    await this.request({ method: 'HEAD' });
    return this.getOffsetFromResponse();
  }

  protected getOffsetFromResponse(): number | undefined {
    const offset = this.getValueFromResponse('Upload-Offset');
    return offset ? parseInt(offset, 10) : undefined;
  }
}
