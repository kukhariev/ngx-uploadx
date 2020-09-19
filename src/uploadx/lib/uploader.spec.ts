import { ajax } from 'ngx-uploadx';

// noinspection ES6PreferShortImport
import { UploaderOptions } from './interfaces';
import { Uploader } from './uploader';

// tslint:disable: no-any
function getFile(): File {
  return new File(['-'], 'filename.mp4', { type: 'video/mp4', lastModified: Date.now() });
}

const file = getFile();

const snip = { file, size: 1, name: 'filename.mp4' };

let uploader: MockUploader;

export class MockUploader extends Uploader {
  constructor(readonly f: File, readonly opts: UploaderOptions) {
    super(f, opts, () => {}, ajax);
  }

  shouldReject(): boolean {
    return this.responseStatus >= 400 || !this.responseStatus;
  }

  async getFileUrl(): Promise<string> {
    return this.shouldReject() ? Promise.reject() : Promise.resolve('');
  }

  async getOffset(): Promise<number> {
    return this.shouldReject() ? Promise.reject() : Promise.resolve(this.size);
  }

  async sendFileContent(): Promise<number> {
    return this.shouldReject() ? Promise.reject() : Promise.resolve(this.size);
  }
}

describe('Uploader', () => {
  describe('constructor()', () => {
    it('should new()', () => {
      uploader = new MockUploader(file, { retryConfig: { maxAttempts: 1 } });
      expect(uploader).toEqual(jasmine.objectContaining(snip));
    });
  });

  describe('configure', () => {
    beforeEach(() => {
      uploader = new MockUploader(file, {});
    });
    it('should abort on pause', () => {
      const abort = spyOn<any>(uploader, 'abort').and.callThrough();
      const stateChange = spyOn<any>(uploader, 'stateChange').and.callThrough();
      uploader.configure({ action: 'pause' });
      expect(abort).toHaveBeenCalled();
      expect(stateChange).toHaveBeenCalled();
    });
    it('should cancel', () => {
      const abort = spyOn<any>(uploader, 'abort').and.callThrough();
      const onCancel = spyOn<any>(uploader, 'cancel').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      uploader.configure({ action: 'cancel' });
      expect(abort).toHaveBeenCalled();
      expect(cleanup).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('chunkSize', () => {
    it('should use adaptive chunkSize if not specified', async () => {
      uploader = new MockUploader(getFile(), {});
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(4096 * 256);
    });
    it('should set fixed chunkSize', async () => {
      uploader = new MockUploader(file, { chunkSize: 4_194_304 });
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(4_194_304);
    });
    it('should disable chunks', async () => {
      uploader = new MockUploader(file, { chunkSize: 0 });
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(1);
    });
  });

  describe('upload()', () => {
    beforeEach(() => {
      uploader = new MockUploader(file, {});
    });
    it('should complete on 200', async () => {
      uploader.responseStatus = 200;
      const getFileUrl = spyOn(uploader, 'getFileUrl').and.callThrough();
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(getFileUrl).toHaveBeenCalledTimes(1);
      expect(getOffset).toHaveBeenCalledTimes(0);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
    it('should complete on 201', async () => {
      uploader.responseStatus = 201;
      const start = spyOn(uploader, 'upload').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(start).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
  });

  describe('prerequest', () => {
    const injected = { headers: { Auth: 'token' } };
    it('sync', async () => {
      uploader = new MockUploader(file, { prerequest: req => ({ ...req, ...injected }) });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(injected));
    });
    it('async', async () => {
      uploader = new MockUploader(file, {
        prerequest: req => Promise.resolve({ ...req, ...injected })
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(injected));
    });
    it('void', async () => {
      uploader = new MockUploader(file, { prerequest: (() => {}) as any });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining({ method: 'POST' }));
    });
  });
});
