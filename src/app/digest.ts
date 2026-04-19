import { RequestConfig, Uploader } from 'ngx-uploadx';

export function readBlob(body: Blob, signal?: AbortSignal): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const reader = new FileReader();
    signal?.addEventListener('abort', () => reader.abort(), { once: true });
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
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
  async digestHex(body: Blob, signal?: AbortSignal): Promise<string> {
    const buffer = await readBlob(body, signal);
    const buf = await this.sha(buffer);
    return bufferToHex(buf);
  },
  async digestBase64(body: Blob, signal?: AbortSignal): Promise<string> {
    const buffer = await readBlob(body, signal);
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
        .digestBase64(body, req.signal)
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
        : await hasher.digestBase64(req.body, req.signal);
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
      hasher.digestBase64(body, req.signal).then(digest => {
        const key = `${body.size}-${start}`;
        hasher.prefetch[req.url] = { key, sha: digest };
      });
    }
    const key = `${req.body.size}-${this.offset}`;
    const sha =
      hasher.prefetch[req.url]?.key === key
        ? hasher.prefetch[req.url].sha
        : await hasher.digestBase64(req.body, req.signal);
    Object.assign(req.headers, { Digest: `sha=${sha}` });
  }
  return req;
}
