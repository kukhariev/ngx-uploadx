import { resolveUrl, unfunc, Uploader } from 'ngx-uploadx';

export class UploaderExt extends Uploader {
  responseType = 'json' as 'json';

  async getFileUrl(): Promise<string> {
    this.offset = 0;
    const formData: FormData = new FormData();
    formData.set('metadata', JSON.stringify(this.metadata));
    formData.append('file', this.file, this.file.name);
    await this.request({
      method: 'POST',
      body: formData,
      url: this.endpoint
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

  updateToken = async (): Promise<string | void> => {
    const token = await unfunc(this.token || '', this.responseStatus);
    this.headers.Authorization = `Basic ${token}`;
  };
}
