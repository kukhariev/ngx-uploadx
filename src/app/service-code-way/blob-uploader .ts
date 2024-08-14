import { Uploader } from 'ngx-uploadx';

/**
 *  Azure Blob Storage support
 * @example
 *   options: UploadxOptions = {
 *     allowedTypes: 'image/*,video/*',
 *     maxChunkSize: 512 * 1024 * 1024,
 *     endpoint: `[signedURL]`,
 *     uploaderClass: BlobUploader
 *   };
 */
export class BlobUploader extends Uploader {
  blockList: string[] = [];
  override async getFileUrl(): Promise<string> {
    const oUrl = new URL(this.endpoint);
    oUrl.pathname = [oUrl.pathname, this.file.name].join('/');
    const url = oUrl.toString();
    return url;
  }

  override async sendFileContent(): Promise<number | undefined> {
    const { body, start, end } = this.getChunk();
    const blockId = btoa(this.uploadId + String(start).padStart(15, '0'));
    const url = this.url + `&comp=block&blockid=${encodeURIComponent(blockId)}`;
    const headers = commonHeaders();
    await this.request({ method: 'PUT', headers, url, body });
    this.blockList.push(blockId);
    if (end === this.size) {
      await this.finish();
    }
    return this.responseStatus > 201 ? start : end;
  }

  async finish() {
    const blocks = this.blockList.map(blockId => '<Latest>' + blockId + '</Latest>').join();
    const body = `<?xml version="1.0" encoding="utf-8"?><BlockList>${blocks}</BlockList>`;
    const url = this.url + `&comp=blocklist`;
    const headers = { ...commonHeaders(), 'Content-Type': 'text/xml; charset=UTF-8' };
    await this.request({ method: 'PUT', headers, url, body });
    return this.size;
  }

  override abort(): void {} // FIXME: Azurite does not support blob upload interrupts?!

  override async getOffset(): Promise<number | undefined> {
    const url = this.url + `&comp=blocklist&blocklisttype=all`;
    const headers = commonHeaders();
    try {
      await this.request({ headers, url });
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.response, 'text/xml');
      const blocks = xmlDoc
        .getElementsByTagName('UncommittedBlocks')[0]
        .getElementsByTagName('Block');
      const sizes = Array.from(blocks).map(
        el => +(el.getElementsByTagName('Size')[0]?.textContent ?? '0')
      );
      return sizes.reduce((acc, v) => acc + v, 0);
    } catch {}
    return this.offset || 0;
  }
}

function commonHeaders(apiVersion = '2022-11-02') {
  return {
    'x-ms-version': apiVersion,
    'x-ms-date': new Date().toISOString()
  };
}
