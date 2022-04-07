import { Canceler, RequestConfig, Uploader } from 'ngx-uploadx';

export const hasher = {
  isSupported: window.crypto && !!window.crypto.subtle,
  async sha(data: ArrayBuffer): Promise<string> {
    const dig = await crypto.subtle.digest('SHA-1', data);
    return String.fromCharCode(...new Uint8Array(dig));
  },
  getDigest(body: Blob, canceler?: Canceler): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      canceler && (canceler.onCancel = () => reject('aborted' && reader.abort()));
      reader.onload = async () => resolve(await this.sha(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(body);
    });
  }
};

export async function injectTusChecksumHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    const sha = await hasher.getDigest(req.body, req.canceler);
    Object.assign(req.headers, { 'Upload-Checksum': `sha1 ${btoa(sha)}` });
  }
  return req;
}

export async function injectDigestHeader(
  this: Uploader,
  req: RequestConfig
): Promise<RequestConfig> {
  if (hasher.isSupported && req.body instanceof Blob) {
    const sha = await hasher.getDigest(req.body, req.canceler);
    Object.assign(req.headers, { Digest: `sha=${btoa(sha)}` });
  }
  return req;
}
