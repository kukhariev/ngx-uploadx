/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajax, AjaxRequestConfig } from './ajax';
import { UploaderOptions } from './interfaces';
import { Uploader } from './uploader';

let serverStatus: number;

const mockAjax: Ajax = {
  request<T>(
    config: AjaxRequestConfig
  ): Promise<{ data: T; status: number; headers: Record<string, string> }> {
    if (!serverStatus) {
      return Promise.reject();
    }
    return Promise.resolve({ data: '' as unknown as T, headers: {}, status: serverStatus });
  }
};

function getFile(): File {
  return new File(['0123456789'], 'filename.mp4', {
    type: 'video/mp4',
    lastModified: new Date(2020, 6).getTime()
  });
}

const file = getFile();

const snip = { file, size: 10, name: 'filename.mp4' };

let uploader: MockUploader;

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
      expect(uploader.chunkSize).toEqual(10);
    });
  });

  describe('upload()', () => {
    beforeEach(() => {
      uploader = new MockUploader(file, { retryConfig: { maxAttempts: 3 }, token: 'token' });
    });

    it('should retry on 0', async () => {
      const retry = spyOn<any>(uploader.retry, 'wait');
      serverStatus = 0;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(0);
      expect(retry).toHaveBeenCalledTimes(3);
    });
    it('should error on 400', async () => {
      serverStatus = 400;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(400);
      expect(uploader.status).toEqual('error');
    });
    it('should updateToken on 401', async () => {
      const updateToken = spyOn<any>(uploader, 'updateToken').and.callThrough();
      serverStatus = 401;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(401);
      expect(updateToken).toHaveBeenCalledTimes(4);
    });
    it('should retry on 500', async () => {
      serverStatus = 500;
      const retry = spyOn<any>(uploader.retry, 'wait');
      await uploader.upload();
      expect(retry).toHaveBeenCalledTimes(3);
      expect(uploader.status).toEqual('error');
    });
    it('should complete on 200', async () => {
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
    serverStatus = 200;

    it('should report progress if content is uploading', async () => {
      uploader = new MockUploader(file, {});
      uploader.offset = 0;
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST', body: new FormData() });
      expect((request.calls.mostRecent().args[0] as any).onUploadProgress).toBeTruthy();
    });

    it('should not report progress if offset is undefined', async () => {
      uploader = new MockUploader(file, {});
      uploader.offset = undefined;
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST', body: new FormData() });
      expect((request.calls.mostRecent().args[0] as any).onUploadProgress).toBeUndefined();
    });
  });

  describe('prerequest', () => {
    const common = { common: 'true' };
    const auth = { auth: 'token' };
    const injected = { headers: auth };
    const sample = { headers: { ...auth, ...common }, method: 'POST' };
    it('sync', async () => {
      serverStatus = 201;
      uploader = new MockUploader(file, {
        prerequest: req => ({ ...req, ...injected })
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST', headers: common });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(sample));
    });
    it('async', async () => {
      serverStatus = 201;
      uploader = new MockUploader(file, {
        headers: common,
        prerequest: req => Promise.resolve({ ...req, ...injected })
      });
      const request = spyOn<any>(uploader.ajax, 'request').and.callThrough();
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(jasmine.objectContaining(sample));
    });
    it('void', async () => {
      serverStatus = 201;
      uploader = new MockUploader(file, {
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
