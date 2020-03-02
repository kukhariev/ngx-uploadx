import { Uploader } from 'ngx-uploadx';

/**
 *
 * Basic multipart/form-data uploader
 * for use with multer
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
    formData.append('file', this.file, this.file.name);
    await this.request({
      method: 'POST',
      body: formData,
      url: this.endpoint,
      progress: true
    });
    this.offset = this.size;
    return '';
  }

  async sendFileContent(): Promise<number | undefined> {
    return this.size;
  }

  async getOffset(): Promise<number | undefined> {
    return 0;
  }
}
