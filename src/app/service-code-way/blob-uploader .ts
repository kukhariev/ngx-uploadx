import { Uploader } from 'ngx-uploadx';

/**
 *  Azure Blob Storage support
 * @example
 *   options: UploadxOptions = {
 *     allowedTypes: 'image/*,video/*',
 *     chunksize: 100 * 1024 * 1024,
 *     endpoint: `[signedURL]`,
 *     uploaderClass: BlobUploader
 *   };
 */
export class BlobUploader extends Uploader {
  override async getFileUrl(): Promise<string> {
    const headers = {
      ...commonHeaders(),
      'x-ms-blob-type': 'AppendBlob'
    };
    const oUrl = new URL(this.endpoint);
    oUrl.pathname = [oUrl.pathname, this.file.name].join('/');
    const url = oUrl.toString();
    await this.request({ method: 'PUT', url, headers });
    return url;
  }

  override async sendFileContent(): Promise<number | undefined> {
    const { body, start, end } = this.getChunk();
    const url = `${this.url}&comp=appendblock`;
    const headers = {
      ...commonHeaders(),
      'x-ms-blob-condition-appendpos': start,
      'x-ms-blob-condition-maxsize': this.size
    };
    await this.request({ method: 'PUT', body, headers, url });
    return this.responseStatus > 201 ? start : end;
  }

  override abort(): void {} // FIXME: Azurite does not support blob upload interrupts?!

  override async getOffset(): Promise<number | undefined> {
    const headers = { ...commonHeaders() };
    await this.request({ method: 'HEAD', headers, url: this.url });
    if (this.responseStatus === 200) {
      return Number(this.responseHeaders['content-length']) || 0;
    }
    this.url = '';
    return this.offset || 0;
  }
}

function commonHeaders(apiVersion = '2022-11-02') {
  return {
    'x-ms-version': apiVersion,
    'x-ms-date': new Date().toISOString()
  };
}
