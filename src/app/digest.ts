import { Canceler, RequestConfig, Uploader } from 'ngx-uploadx';

export function readBlob(body: Blob, canceler?: Canceler): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (canceler) {
      canceler.onCancel = () => {
        reader.abort();
        reject('aborted');
      };
    }
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(body);
  });
}

export function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), x => x.toString(16).padStart(2, '0')).join('');
}

export function bufferToBase64(hash: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export const hasher = {
  /**
   * Prefetched hash of the next chunk.
   * Key: upload URL. Value: chunk data + hash.
   * Cleared on completion or if offset/size do not match.
   */
  prefetch: {} as Record<string, { key: string; sha: string }>,
  isSupported: typeof window !== 'undefined' && window.crypto && !!window.crypto.subtle,
  async sha(data: ArrayBuffer): Promise<ArrayBuffer> {
    return crypto.subtle.digest('SHA-1', data);
  },
  async digestHex(body: Blob, canceler?: Canceler): Promise<string> {
    const buffer = await readBlob(body, canceler);
    const buf = await this.sha(buffer);
    return bufferToHex(buf);
  },
  async digestBase64(body: Blob, canceler?: Canceler): Promise<string> {
    const buffer = await readBlob(body, canceler);
    const hash = await this.sha(buffer);
    return bufferToBase64(hash);
  }
};

export async function injectTusChecksumHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    if (this.chunkSize) {
      const { body, start } = this.getChunk((this.offset || 0) + this.chunkSize);
      hasher
        .digestBase64(body, req.canceler)
        .then(digest => {
          const key = `${body.size}-${start}`;
          hasher.prefetch[req.url] = { key, sha: digest };
        })
        .catch(() => {
          delete hasher.prefetch[req.url];
        });
    }
    const key = `${req.body.size}-${this.offset}`;
    const sha =
      hasher.prefetch[req.url]?.key === key
        ? hasher.prefetch[req.url].sha
        : await hasher.digestBase64(req.body, req.canceler);
    Object.assign(req.headers, { 'Upload-Checksum': `sha1 ${sha}` });
  }
  return req;
}

export async function injectDigestHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    if (this.chunkSize) {
      const { body, start } = this.getChunk((this.offset || 0) + this.chunkSize);
      hasher.digestBase64(body, req.canceler).then(digest => {
        const key = `${body.size}-${start}`;
        hasher.prefetch[req.url] = { key, sha: digest };
      });
    }
    const key = `${req.body.size}-${this.offset}`;
    const sha =
      hasher.prefetch[req.url]?.key === key
        ? hasher.prefetch[req.url].sha
        : await hasher.digestBase64(req.body, req.canceler);
    Object.assign(req.headers, { Digest: `sha=${sha}` });
  }
  return req;
}
