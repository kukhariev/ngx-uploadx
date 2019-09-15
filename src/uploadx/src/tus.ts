import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { b64, resolveUrl } from './utils';

export class Tus extends Uploader {
  constructor(readonly file: File, options: UploadxOptions) {
    super(file, options);
    this.headers['Tus-Resumable'] = '1.0.0';
  }

  async getFileUrl(): Promise<string> {
    const encodedMetaData = b64.serialize(this.metadata);
    const headers = {
      'Upload-Length': `${this.size}`,
      'Upload-Metadata': `${encodedMetaData}`
    };

    await this.request({
      method: 'POST',
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
    const { body } = this.getChunk();
    const headers = {
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': `${this.offset}`
    };
    await this.request({
      method: 'PATCH',
      body,
      headers
    });
    return this.getOffsetFromResponse();
  }

  async getOffset(): Promise<number | undefined> {
    await this.request({ method: 'HEAD' });
    return this.getOffsetFromResponse();
  }

  protected getOffsetFromResponse(): number | undefined {
    const offsetStr = this.getValueFromResponse('Upload-Offset');
    return offsetStr ? parseInt(offsetStr, 10) : undefined;
  }
}
