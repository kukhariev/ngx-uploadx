import { resolveUrl, Uploader } from 'ngx-uploadx';

/**
 *
 * multipart/form-data extended uploader for use with node-uploadx
 *
 * @example
 *
 *   options: UploadxOptions = {
 *     allowedTypes: 'image/*',
 *     uploaderClass: MultiPartFormData
 *   };
 */
export class MultiPartFormData extends Uploader {
  responseType = 'json' as XMLHttpRequestResponseType;
  async getFileUrl(): Promise<string> {
    this.offset = 0;
    const formData: FormData = new FormData();
    formData.set('metadata', JSON.stringify(this.metadata));
    formData.append('file', this.file, this.file.name);
    await this.request({
      method: 'POST',
      body: formData,
      url: this.endpoint,
      progress: true
    });
    this.offset = this.size;
    const location = this.getValueFromResponse('location');
    return location ? resolveUrl(location, this.endpoint) : '';
  }

  async sendFileContent(): Promise<number | undefined> {
    return this.size;
  }

  async getOffset(): Promise<number | undefined> {
    return 0;
  }
}
