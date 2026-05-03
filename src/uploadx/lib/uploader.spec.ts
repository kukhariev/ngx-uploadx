/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajax } from './ajax';
import { DynamicChunk } from './dynamic-chunk';
import { UploaderOptions, UploadStatus } from './interfaces';
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
  request(): Promise<{
    data: any;
    status: number;
    headers: Record<string, string>;
  }> {
    return !serverStatus
      ? Promise.reject()
      : Promise.resolve({ data: '', headers: {}, status: serverStatus });
  }
};

export class MockUploader extends Uploader {
  constructor(
    readonly f: File,
    readonly opts: UploaderOptions,
    readonly stateChange: (uploader: Uploader) => void = () => {}
  ) {
    super(f, opts, stateChange, mockAjax);
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
      expect(uploader).toEqual(expect.objectContaining(snip));
    });
  });

  describe('configure', () => {
    it('should abort on pause', () => {
      const uploader = new MockUploader(file, {});
      const abort = vi.spyOn<Uploader, any>(uploader, 'abort');
      const stateChange = vi.spyOn(uploader, 'stateChange');
      uploader.configure({ action: 'pause' });
      expect(abort).toHaveBeenCalled();
      expect(stateChange).toHaveBeenCalled();
    });

    it('should cancel', () => {
      const uploader = new MockUploader(file, {});
      const abort = vi.spyOn<Uploader, any>(uploader, 'abort');
      const onCancel = vi.spyOn<Uploader, any>(uploader, 'cancel');
      const cleanup = vi.spyOn<Uploader, any>(uploader, 'cleanup');
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
      uploader.getChunk();
      expect(uploader.chunkSize).toEqual(chunkInit.size);
    });

    it('should set fixed chunkSize', async () => {
      const uploader = new MockUploader(file, { chunkSize: 4194304 });
      uploader.getChunk();
      expect(uploader.chunkSize).toEqual(4194304);
    });

    it('should disable chunks', async () => {
      const uploader = new MockUploader(file, { chunkSize: 0 });
      uploader.getChunk();
      expect(uploader.chunkSize).toEqual(10);
    });

    it('should limit on 413', async () => {
      const uploader = new MockUploader(file, {});
      uploader.responseStatus = 413;
      uploader.getChunk();
      expect(uploader.chunkSize).toEqual(chunkInit.size / 2);
      expect(DynamicChunk.maxSize).toEqual(chunkInit.size / 2);
    });
  });

  describe('upload()', () => {
    it('should retry on 0', async () => {
      const uploader = new MockUploader(file, {
        retryConfig: { maxAttempts: 2 },
        token: 'token'
      });
      const retry = vi.spyOn(uploader.retry, 'wait');
      serverStatus = 0;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(0);
      expect(retry).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should error on 400', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 2 }, token: 'token' });
      serverStatus = 400;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(400);
      expect(uploader.status).toEqual('error');
    });

    it('should updateToken on 401', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 2 }, token: 'token' });
      const updateToken = vi.spyOn(uploader, 'updateToken');
      serverStatus = 401;
      await uploader.upload();
      expect(uploader.responseStatus).toEqual(401);
      expect(updateToken).toHaveBeenCalledTimes(3);
    });

    it('should retry on 500', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 2 }, token: 'token' });
      serverStatus = 500;
      const retry = vi.spyOn(uploader.retry, 'wait');
      await uploader.upload();
      expect(retry).toHaveBeenCalledTimes(2);
      expect(uploader.status).toEqual('error');
    });

    it('should complete on 200', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 2 }, token: 'token' });
      serverStatus = 200;
      const updateToken = vi.spyOn(uploader, 'updateToken');
      const getFileUrl = vi.spyOn(uploader, 'getFileUrl');
      const getOffset = vi.spyOn(uploader, 'getOffset');
      const sendFileContent = vi.spyOn(uploader, 'sendFileContent');
      const cleanup = vi.spyOn<Uploader, any>(uploader, 'cleanup');
      const wait = vi.spyOn(uploader.retry, 'wait');
      await uploader.upload();
      expect(updateToken).toHaveBeenCalledTimes(1);
      expect(getFileUrl).toHaveBeenCalledTimes(1);
      expect(getOffset).toHaveBeenCalledTimes(1);
      expect(sendFileContent).toHaveBeenCalledTimes(10);
      expect(cleanup).toHaveBeenCalled();
      expect(wait).toHaveBeenCalledTimes(0);
      expect(uploader.status).toEqual('complete');
    });

    it('should complete on 201', async () => {
      const uploader = new MockUploader(file, { retryConfig: { maxAttempts: 2 }, token: 'token' });
      serverStatus = 201;
      const start = vi.spyOn(uploader, 'upload');
      const cleanup = vi.spyOn<Uploader, any>(uploader, 'cleanup');
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
      const onProgressSpy = vi.spyOn<Uploader, any>(uploader, 'onProgress');
      await uploader.request({ method: 'POST', body });
      expect(onProgressSpy).not.toHaveBeenCalled();
    });

    it('should report progress if content is uploading', async () => {
      serverStatus = 200;
      const uploader = new MockUploader(file, {});
      uploader.offset = 0;
      const onProgressSpy = vi.spyOn<Uploader, any>(uploader, 'onProgress');
      await uploader.request({ method: 'POST', body });
      expect(onProgressSpy).toHaveBeenCalled();
    });

    it('should call authorize', async () => {
      serverStatus = 200;
      const uploader = new MockUploader(file, {});
      const request = vi.spyOn<Uploader, any>(uploader, '_authorize');
      await uploader.request({ method: 'GET' });
      expect(request).toHaveBeenCalledTimes(1);
    });

    it('should skip authorize', async () => {
      serverStatus = 200;
      const uploader = new MockUploader(file, {});
      const request = vi.spyOn<Uploader, any>(uploader, '_authorize');
      await uploader.request({ method: 'GET', skipAuthorization: true });
      expect(request).toHaveBeenCalledTimes(0);
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
      const request = vi.spyOn<any, any>(uploader.ajax, 'request');
      await uploader.request({ method: 'POST', headers: common });
      expect(request).toHaveBeenCalledWith(expect.objectContaining(sample));
    });

    it('async', async () => {
      serverStatus = 201;
      const uploader = new MockUploader(file, {
        headers: common,
        prerequest: req => Promise.resolve({ ...req, ...injected })
      });
      const request = vi.spyOn<any, any>(uploader.ajax, 'request');
      await uploader.request({ method: 'POST' });
      expect(request).toHaveBeenCalledWith(expect.objectContaining(sample));
    });

    it('void', async () => {
      serverStatus = 201;
      const uploader = new MockUploader(file, {
        prerequest: req => {
          req.headers['auth'] = 'token';
        }
      });
      const request = vi.spyOn<any, any>(uploader.ajax, 'request');
      await uploader.request({ method: 'POST', headers: common });
      expect(request).toHaveBeenCalledWith(expect.objectContaining(sample));
    });
  });

  describe('status transitions', () => {
    let uploader: MockUploader;

    beforeEach(() => {
      uploader = new MockUploader(file, {}, vi.fn());
      vi.spyOn<any, any>(uploader, 'update').mockResolvedValue('');
    });

    // Valid transitions: [from, to]
    const validTransitions: [UploadStatus, UploadStatus][] = [
      ['queue', 'uploading'],
      ['queue', 'paused'],
      ['uploading', 'complete'],
      ['uploading', 'error'],
      ['uploading', 'paused'],
      ['uploading', 'retry'],
      ['uploading', 'updated'],
      ['retry', 'uploading'],
      ['paused', 'queue'],
      ['paused', 'cancelled'],
      ['error', 'queue'],
      ['error', 'cancelled'],
      ['complete', 'updated'],
      ['complete', 'cancelled']
    ];

    // Invalid transitions: [from, to]
    const invalidTransitions: [UploadStatus, UploadStatus][] = [
      ['cancelled', 'queue'],
      ['complete', 'uploading'],
      ['complete', 'error'],
      ['uploading', 'queue']
    ];

    describe('valid transitions', () => {
      it.each(validTransitions)('should allow %s → %s', (from, to) => {
        uploader.status = from;
        uploader.status = to;
        expect(uploader.status).toBe(to);
      });
    });

    describe('invalid transitions', () => {
      it.each(invalidTransitions)('should reject %s → %s', (from, to) => {
        uploader.status = from;
        uploader.status = to;
        expect(uploader.status).toBe(from);
      });
    });

    describe('side effects', () => {
      it('should call abort on pause', () => {
        const abortSpy = vi.spyOn<any, any>(uploader, 'abort');
        uploader.status = 'paused';
        expect(abortSpy).toHaveBeenCalled();
      });

      it.each<UploadStatus>(['cancelled', 'complete', 'error'])(
        'should call cleanup on %s',
        status => {
          const cleanupSpy = vi.spyOn<any, any>(uploader, 'cleanup');
          uploader.status = status;
          expect(cleanupSpy).toHaveBeenCalled();
        }
      );

      it('should cancel retry when leaving retry state', () => {
        uploader.status = 'retry';
        const retryCancelSpy = vi.spyOn(uploader.retry, 'cancel');
        uploader.status = 'error';
        expect(retryCancelSpy).toHaveBeenCalled();
      });
    });

    describe('idempotency', () => {
      it('should ignore duplicate status', () => {
        const stateChange = vi.fn();
        uploader = new MockUploader(file, {}, stateChange);
        uploader.status = 'uploading';
        const callCount = stateChange.mock.calls.length;
        uploader.status = 'uploading';
        expect(stateChange.mock.calls.length).toBe(callCount);
      });
    });
  });
});
