// noinspection ES6PreferShortImport
import { ErrorHandler } from './error-handler';
import { Uploader } from './uploader';

// tslint:disable: no-any
function getFile(): File {
  return new File(['-'], 'filename.mp4', { type: 'video/mp4', lastModified: Date.now() });
}

const file = getFile();

const snip = { file, size: 1, name: 'filename.mp4' };

let uploader: MockUploader;

ErrorHandler.maxAttempts = 2;

export class MockUploader extends Uploader {
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
      uploader = new MockUploader(file, {});
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
    it('should onCancel on cancel', () => {
      const abort = spyOn<any>(uploader, 'abort').and.callThrough();
      const onCancel = spyOn<any>(uploader, 'onCancel').and.callThrough();
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
    it('should queue on 0', async () => {
      uploader.responseStatus = 0;
      await uploader.upload();
      expect(uploader.status).toEqual('queue');
    });
    it('should error on 400', async () => {
      uploader.responseStatus = 400;
      await uploader.upload();
      expect(uploader.status).toEqual('error');
    });
    it('should queue on 401', async () => {
      uploader.responseStatus = 401;
      const updateToken = spyOn<any>(uploader, 'updateToken').and.callThrough();
      await uploader.upload();
      expect(updateToken).toHaveBeenCalled();
      expect(uploader.status).toEqual('queue');
    });
    it('should queue on 500', async () => {
      uploader.responseStatus = 500;
      await uploader.upload();
      expect(uploader.status).toEqual('queue');
    });
    it('should complete on 200', async () => {
      uploader.responseStatus = 200;
      const start = spyOn(uploader, 'start').and.callThrough();
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(start).toHaveBeenCalledTimes(1);
      expect(getOffset).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
    it('should complete on 201', async () => {
      uploader.responseStatus = 201;
      const start = spyOn(uploader, 'start').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(start).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      uploader = new MockUploader(file, {});
      (uploader as any).offset = undefined;
      uploader.status = 'uploading';
    });
    it('should error on 400', async () => {
      uploader.responseStatus = 400;
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      await uploader.start();
      expect(getOffset).toHaveBeenCalledTimes(1);
      expect(uploader.status).toEqual('error');
    });
    it('should queue on 404', async () => {
      uploader.responseStatus = 404;
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      await uploader.start();
      expect(getOffset).toHaveBeenCalledTimes(1);
      expect(uploader.status).toEqual('queue');
    });
    it('should retry on 0', async () => {
      uploader.responseStatus = 0;
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      await uploader.start();
      expect(getOffset).toHaveBeenCalledTimes(2);
      expect(uploader.status).toEqual('error');
    });
    it('should retry on 500', async () => {
      uploader.responseStatus = 500;
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      await uploader.start();
      expect(getOffset).toHaveBeenCalledTimes(2);
      expect(uploader.status).toEqual('error');
    });
    it('should complete on 200', async () => {
      uploader.responseStatus = 200;
      await uploader.start();
      expect((uploader as any).offset).toEqual(1);
      expect(uploader.status).toEqual('complete');
    });
  });
  describe('prerequest', () => {
    const injected = { headers: { Auth: 'token' } };
    it('sync', async () => {
      uploader = new MockUploader(file, { prerequest: req => ({ ...req, ...injected }) });
      const _request = spyOn<any>(uploader, '_request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(_request).toHaveBeenCalledWith({ method: 'POST', headers: { Auth: 'token' } });
    });
    it('async', async () => {
      uploader = new MockUploader(file, {
        prerequest: req => Promise.resolve({ ...req, ...injected })
      });
      const _request = spyOn<any>(uploader, '_request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(_request).toHaveBeenCalledWith({ method: 'POST', headers: { Auth: 'token' } });
    });
    it('void', async () => {
      uploader = new MockUploader(file, { prerequest: (() => {}) as any });
      const _request = spyOn<any>(uploader, '_request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(_request).toHaveBeenCalledWith({ method: 'POST' });
    });
  });
});
