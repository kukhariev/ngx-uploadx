import { UploadxOptions, Uploader } from 'ngx-uploadx';
/**
 * Implements nginx-upload-module resumable uploads protocol.
 * @see
 * https://github.com/fdintino/nginx-upload-module/blob/master/upload-protocol.md
 */

export class UploaderNginxUploadModule extends Uploader {
  ready = 0;
  constructor(readonly file: File, options: UploadxOptions) {
    super(file, options);
    this.offset = 0;
  }
  async getFileURI(): Promise<string> {
    return this.endpoint;
  }

  async getOffset(): Promise<number> {
    return this.ready;
  }

  async sendFileContent(): Promise<number> {
    const end = this.chunkSize ? Math.min(this.offset + this.chunkSize, this.size) : this.size;
    const body = this.file.slice(this.offset, end);
    const headers = {
      'Content-Type': this.mimeType,
      'Session-ID': `${this.uploadId}`,
      'Content-Disposition': 'attachment; filename="' + encodeURIComponent(this.name) + '"',
      'Content-Range': `bytes ${this.offset}-${end - 1}/${this.size}`
    };
    const _ = await this.request({
      method: 'POST',
      body,
      url: this.URI,
      headers,
      progress: true
    });
    return this.getOffsetFromResponse();
  }
  private getOffsetFromResponse() {
    if (this.responseStatus === 201) {
      const [total, end, start] = this.response
        .split(/\D+/)
        .filter((v: string) => v.length)
        .map((s: string) => +s)
        .reverse();
      if (isNaN(end)) {
        throw new Error('Range is missing!');
      }
      this.ready = end + 1;
      return this.ready;
    } else if (this.responseStatus === 200) {
      return this.size;
    }
    return this.ready;
  }
}
