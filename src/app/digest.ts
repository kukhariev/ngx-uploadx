import { Canceler, RequestConfig, Uploader } from 'ngx-uploadx';

export function readBlob(body: Blob, canceler?: Canceler): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    canceler && (canceler.onCancel = () => reject('aborted' && reader.abort()));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(body);
  });
}

export function bufferToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), x => x.toString(16).padStart(2, '0')).join('');
}

export function bufferToBase64(hash: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export const hasher = {
  lookup: {} as Record<string, { key: string; sha: string }>,
  isSupported: window.crypto && !!window.crypto.subtle,
  async sha(data: ArrayBuffer): Promise<ArrayBuffer> {
    return crypto.subtle.digest('SHA-1', data);
  },
  digestHex(body: Blob, canceler?: Canceler): Promise<string> {
    return readBlob(body, canceler).then(buffer => this.sha(buffer).then(bufferToHex));
  },
  digestBase64(body: Blob, canceler?: Canceler): Promise<string> {
    return readBlob(body, canceler).then(buffer => this.sha(buffer).then(bufferToBase64));
  }
};

export async function injectTusChecksumHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    if (this.chunkSize) {
      const { body, start } = this.getChunk((this.offset || 0) + this.chunkSize);
      hasher.digestBase64(body, req.canceler).then(digest => {
        const key = `${body.size}-${start}`;
        hasher.lookup[req.url] = { key, sha: digest };
      });
    }
    const key = `${req.body.size}-${this.offset}`;
    const sha =
      hasher.lookup[req.url]?.key === key
        ? hasher.lookup[req.url].sha
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
        hasher.lookup[req.url] = { key, sha: digest };
      });
    }
    const key = `${req.body.size}-${this.offset}`;
    const sha =
      hasher.lookup[req.url]?.key === key
        ? hasher.lookup[req.url].sha
        : await hasher.digestBase64(req.body, req.canceler);
    Object.assign(req.headers, { Digest: `sha=${sha}` });
  }
  return req;
}
