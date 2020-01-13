import { ErrorHandler } from './error-handler';
import { Uploader } from './uploader';

function getFile(): File {
  return new File(['-'], 'filename.mp4', { type: 'video/mp4', lastModified: Date.now() });
}
const file = getFile();

const snip = { file, size: 1, name: 'filename.mp4' };

let code = 0;

function shouldReject() {
  return code >= 400 || !code;
}

ErrorHandler.maxAttempts = 2;

export class MockUploader extends Uploader {
  async getFileUrl(): Promise<string> {
    this.responseStatus = code;
    return shouldReject() ? Promise.reject() : Promise.resolve('');
  }
  async getOffset(): Promise<number> {
    this.responseStatus = code;
    return shouldReject() ? Promise.reject() : Promise.resolve(1);
  }
  async sendFileContent(): Promise<number> {
    this.responseStatus = code;
    return shouldReject() ? Promise.reject() : Promise.resolve(1);
  }
}

describe('constructor()', () => {
  it('should new()', () => {
    const uploader = new MockUploader(file, {});
    expect(uploader).toEqual(jasmine.objectContaining(snip));
  });
});

describe('configure', () => {
  let uploader: MockUploader;
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
  let uploader: MockUploader;
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
  let uploader: MockUploader;
  beforeEach(() => {
    uploader = new MockUploader(file, {});
    (uploader as any).offset = undefined;
    uploader.url = '';
  });
  it('should queue on 0', async () => {
    code = 0;
    await uploader.upload();
    expect(uploader.status).toEqual('queue');
  });
  it('should error on 400', async () => {
    code = 400;
    await uploader.upload();
    expect(uploader.status).toEqual('error');
  });
  it('should queue on 401', async () => {
    code = 401;
    const getToken = spyOn<any>(uploader, 'getToken').and.callThrough();
    await uploader.upload();
    expect(getToken).toHaveBeenCalled();
    expect(uploader.status).toEqual('queue');
  });
  it('should queue on 500', async () => {
    code = 500;
    await uploader.upload();
    expect(uploader.status).toEqual('queue');
  });
  it('should complete on 200', async () => {
    code = 200;
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
    code = 201;
    const start = spyOn(uploader, 'start').and.callThrough();
    const cleanup = spyOn<any>(uploader, 'cleanup').and.callThrough();
    await uploader.upload();
    expect(start).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalled();
    expect(uploader.status).toEqual('complete');
  });
});

describe('start()', () => {
  let uploader: MockUploader;
  beforeEach(() => {
    uploader = new MockUploader(file, {});
    (uploader as any).offset = undefined;
    uploader.status = 'uploading';
  });
  it('should error on 400', async () => {
    code = 400;
    const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
    await uploader.start();
    expect(getOffset).toHaveBeenCalledTimes(1);
    expect(uploader.status).toEqual('error');
  });
  it('should queue on 404', async () => {
    code = 404;
    const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
    await uploader.start();
    expect(getOffset).toHaveBeenCalledTimes(1);
    expect(uploader.status).toEqual('queue');
  });
  it('should retry on 0', async () => {
    code = 0;
    const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
    await uploader.start();
    expect(getOffset).toHaveBeenCalledTimes(3);
    expect(uploader.status).toEqual('error');
  });
  it('should retry on 500', async () => {
    code = 500;
    const getOffset = spyOn(uploader, 'getOffset').and.callThrough();
    await uploader.start();
    expect(getOffset).toHaveBeenCalledTimes(3);
    expect(uploader.status).toEqual('error');
  });
  it('should complete on 200', async () => {
    code = 200;
    await uploader.start();
    expect((uploader as any).offset).toEqual(1);
    expect(uploader.status).toEqual('complete');
  });
});
