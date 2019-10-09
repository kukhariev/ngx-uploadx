import { b64, resolveUrl, Tus } from 'ngx-uploadx';

/**
 * Implements tus resumable upload protocol
 * @see
 * https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md
 *
 * Creation With Upload extension
 */
export class TusExt extends Tus {
  async getFileUrl(): Promise<string> {
    this.offset = 0;
    this.chunkSize = this.file.size;
    const encodedMetaData = b64.serialize(this.metadata);
    const { body } = this.getChunk();
    const headers = {
      'Upload-Length': `${this.size}`,
      'Upload-Metadata': `${encodedMetaData}`,
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': `${this.offset}`
    };

    await this.request({
      method: 'POST',
      url: this.endpoint,
      headers,
      body
    });
    const location = this.getValueFromResponse('location');
    if (!location) {
      throw new Error('Invalid or missing Location header');
    }
    this.offset = this.getOffsetFromResponse() || this.size;
    return resolveUrl(location, this.endpoint);
  }
}
