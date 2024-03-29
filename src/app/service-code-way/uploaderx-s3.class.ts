import { store, UploaderX } from 'ngx-uploadx';
export interface S3Multipart {
  partSize: number;
  partsUrls: string[];
  Parts?: Part[];
}
interface Part {
  ETag: string;
  PartNumber: number;
}

/**
 * Added `upload directly to S3` support
 *
 * [server example](https://github.com/kukhariev/node-uploadx/blob/master/examples/s3-direct.ts)
 */
export class UploaderXS3 extends UploaderX {
  s3 = {} as S3Multipart;

  override async getFileUrl(): Promise<string> {
    const url = await super.getFileUrl();
    if (this.response?.partSize) {
      this.s3 = { ...this.response };
      this.s3.Parts ??= [];
      store.set(url, JSON.stringify(this.s3));
      this.offset = Math.min(this.s3.Parts.length * this.s3.partSize, this.size);
    }
    return url;
  }

  override async sendFileContent(): Promise<number | undefined> {
    if (this.s3.partsUrls) {
      this.s3.Parts ??= [];
      const i = this.s3.Parts.length;
      const partUrl = this.s3.partsUrls[i];
      const { body, end } = this.getChunk(this.offset, this.s3.partSize);
      await this.request({ method: 'PUT', body, url: partUrl, skipAuthorization: true });
      const ETag = this.getValueFromResponse('etag');
      if (!ETag) {
        throw Error('No access to ETag in response, check CORS configuration!');
      }
      const part: Part = { ETag, PartNumber: i + 1 };
      this.s3.Parts.push(part);
      this.offset = end;
      if (end === this.size) {
        await this.update(this.s3);
      }
      return end;
    } else {
      return super.sendFileContent();
    }
  }

  override async getOffset(): Promise<number | undefined> {
    const _s3 = store.get(this.url);
    if (_s3) {
      this.s3 = JSON.parse(_s3);
      await this.update(this.s3);
      if (this.response?.partsUrls) {
        this.s3 = { ...this.response };
      }
      this.s3.Parts ??= [];
      return Math.min(this.s3.Parts.length * this.s3.partSize, this.size);
    }
    return super.getOffset();
  }
}
