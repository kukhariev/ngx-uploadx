import { b64, Canceler, RequestConfig, Uploader } from 'ngx-uploadx';

export const hasher = {
  isSupported: window.crypto && !!window.crypto.subtle,
  async sha(data: ArrayBuffer): Promise<string> {
    return this.hex(await crypto.subtle.digest('SHA-1', data));
  },
  getDigest(body: Blob, canceler?: Canceler): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      canceler && (canceler.onCancel = () => reject('aborted' && reader.abort()));
      reader.onload = async () => resolve(await this.sha(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(body);
    });
  },
  hex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

export async function injectDigestHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    const sha = await hasher.getDigest(req.body, req.canceler);
    Object.assign(req.headers, { 'Upload-Checksum': `sha1 ${b64.encode(sha)}` });
  }
  return req;
}
