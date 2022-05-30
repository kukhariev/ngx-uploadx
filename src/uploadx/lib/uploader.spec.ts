/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajax } from './ajax';
import { DynamicChunk } from './dynamic-chunk';
import { UploaderOptions } from './interfaces';
import { Uploader } from './uploader';

function getFile(): File {
  return new File(['0123456789'], 'filename.mp4', {
    type: 'video/mp4',
    lastModified: new Date(2020, 6).getTime()
  });
}

const file = getFile();

const snip = { file, size: 10, name: 'filename.mp4' };

const chunkInit = {
  maxSize: DynamicChunk.maxSize,
  size: DynamicChunk.size
};

let serverStatus: number;

const mockAjax: Ajax = {
  request(): Promise<{ data: any; status: number; headers: Record<string, string> }> {
    return !serverStatus
      ? Promise.reject()
      : Promise.resolve({ data: '', headers: {}, status: serverStatus });
  }
};

export class MockUploader extends Uploader {
  constructor(readonly f: File, readonly opts: UploaderOptions) {
    super(f, opts, () => {}, mockAjax);
  }

  async getFileUrl(): Promise<string> {
    await this.request({ method: 'POST' });
    return '/upload/href';
  }

  async getOffset(): Promise<number> {
    await this.request({ method: 'PUT' });
    return 0;
  }

  async sendFileContent(): Promise<number> {
    await this.request({ method: 'PUT' });
    return (this.offset || 0) + 1;
  }
}

describe('Uploader', () => {
  describe('constructor()', () => {
    it('should new()', () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 1 } });
      expect(uploader).toEqual(jasmine.objectContaining(snip));
    });
  });

  describe('configure', () => {
    it('should abort on pause', () => {
      const uploader = new MockUploader(file, {});
      const abort = spyOn<any>(uploader, 'abort').and.callThrough();
      const stateChange = spyOn<any>(uploader, 'stateChange').and.callThrough();
      uploader.configure({ action: 'pause' });
      expect(abort).toHaveBeenCalled();
      expect(stateChange).toHaveBeenCalled();
    });
    it('should cancel', () => {
      const uploader = new MockUploader(file, {});
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
    afterEach(() => {
      DynamicChunk.maxSize = chunkInit.maxSize;
      DynamicChunk.size = chunkInit.size;
    });
    it('should use adaptive chunkSize if not specified', async () => {
      const uploader = new MockUploader(getFile(), {});
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(chunkInit.size);
    });
    it('should set fixed chunkSize', async () => {
      const uploader = new MockUploader(file, { chunkSize: 4_194_304 });
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(4_194_304);
    });
    it('should disable chunks', async () => {
      const uploader = new MockUploader(file, { chunkSize: 0 });
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(10);
    });
    it('should limit on 413', async () => {
      const uploader = new MockUploader(file, {});
      uploader.responseStatus = 413;
      (uploader as any).getChunk();
      expect(uploader.chunkSize).toEqual(chunkInit.size / 2);
      expect(DynamicChunk.maxSize).toEqual(chunkInit.size / 2);
    });
  });

  describe('upload()', () => {
    it('should retry on 0', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      const retry = spyOn<any>(uploader.retry, 'wait');
      serverStatus = 0;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(0);
      expect(retry).toHaveBeenCalledTimes(3);
    });
    it('should error on 400', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      serverStatus = 400;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(400);
      expect(uploader.status).toEqual('error');
    });
    it('should updateToken on 401', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      const updateToken = spyOn<any>(uploader, 'updateToken').and.callThrough();
      serverStatus = 401;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(401);
      expect(updateToken).toHaveBeenCalledTimes(4);
    });
    it('should retry on 500', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      serverStatus = 500;
      const retry = spyOn<any>(uploader.retry, 'wait');
      await uploader.upload();
      expect(retry).toHaveBeenCalledTimes(3);
      expect(uploader.status).toEqual('error');
    });
    it('should complete on 200', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      serverStatus = 200;
      const updateToken = spyOn<any>(uploader, 'updateToken').and.callThrough();
      const getFileUrl = spyOn(uploader, 'getFileUrl').and.callThrough();
      const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
      const sendFileContent = spyOn(uploader, 'sendFileContent').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(updateToken).toHaveBeenCalledTimes(1);
      expect(getFileUrl).toHaveBeenCalledTimes(1);
      expect(getOffset).toHaveBeenCalledTimes(1);
      expect(sendFileContent).toHaveBeenCalledTimes(10);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
    it('should complete on 201', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
      serverStatus = 201;
      const start = spyOn(uploader, 'upload').and.callThrough();
      const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
      await uploader.upload();
      expect(start).toHaveBeenCalledTimes(1);
      expect(cleanup).toHaveBeenCalled();
      expect(uploader.status).toEqual('complete');
    });
  });

  describe('request', () => {
    const body = new Blob(['test']);
    it('should not report progress if offset is undefined', async () => {
      serverStatus = 200;
      const uploader = new MockUploader(file, {});
      const onProgressSpy = spyOn<any>(uploader, 'onProgress').and.callThrough();
      await uploader.request({ method: 'POST', body });
      expect(onProgressSpy).not.toHaveBeenCalled();
    });
    it('should report progress if content is uploading', async () => {
      serverStatus = 200;
      const uploader = new MockUploader(file, {});
      uploader.offset = 0;
      const onProgressSpy = spyOn<any>(uploader, 'onProgress').and.callThrough();
      await uploader.request({ method: 'POST', body });
      expect(onProgressSpy).toHaveBeenCalled();
    });
  });

  describe('prerequest', () => {
    const common = { common: 'true' };
    const auth = { auth: 'token' };
    const injected = { headers: auth };
    const sample = { headers: { ...auth, ...common }, method: 'POST' };
    it('sync', async () => {
      serverStatus = 201;
      const uploader = new MockUploader(file, {
        prerequest: req => ({ ...req, ...injected })
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST', headers: common });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(sample));
    });
    it('async', async () => {
      serverStatus = 201;
      const uploader = new MockUploader(file, {
        headers: common,
        prerequest: req => Promise.resolve({ ...req, ...injected })
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(sample));
    });
    it('void', async () => {
      serverStatus = 201;
      const uploader = new MockUploader(file, {
        prerequest: req => {
          req.headers['auth'] = 'token';
        }
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST', headers: common });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(sample));
    });
  });
});
