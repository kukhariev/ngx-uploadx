import { Uploader } from 'ngx-uploadx';

/**
 * Implements nginx-upload-module resumable uploads protocol.
 * @see
 * https://github.com/fdintino/nginx-upload-module/blob/master/upload-protocol.md
 *
 *  @example
 *
 *   options: UploadxOptions = {
 *     endpoint: '/files'
 *     uploaderClass: NginxUploadModuleUploader
 *   };
 */
export class NginxUploadModuleUploader extends Uploader {
  offset = 0;

  async getFileUrl(): Promise<string> {
    return this.endpoint;
  }

  async getOffset(): Promise<number> {
    return this.offset;
  }

  async sendFileContent(): Promise<number> {
    const { body, end } = this.getChunk();
    const headers = {
      'Content-Type': this.file.type,
      'Session-ID': `${this.uploadId}`,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(this.name)}"`,
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    await this.request({
      method: 'POST',
      body,
      url: this.url,
      headers,
      progress: true
    });
    return this.getOffsetFromResponse();
  }

  // abort not supported
  abort() {}

  private getOffsetFromResponse(): number {
    if (this.responseStatus === 201) {
      const [, end] = this.response
        .split(/\D+/)
        .filter((v: string) => v.length)
        .map(Number)
        .reverse();

      if (isNaN(end)) {
        throw new Error('Range is missing!');
      }
      this.offset = end + 1;
      return this.offset;
    } else if (this.responseStatus === 200) {
      return this.size;
    }
    return this.offset;
  }
}
