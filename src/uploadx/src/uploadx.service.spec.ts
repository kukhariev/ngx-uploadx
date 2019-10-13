import { NgZone } from '@angular/core';
import { UploadAction } from './interfaces';
import { UploadxService } from './uploadx.service';
const ENDPOINT = `http://localhost:3003/upload?user_id=test`;
const options = {
  concurrency: 3,
  allowedTypes: 'image/*,video/*',
  endpoint: ENDPOINT,
  token: '%token%',
  autoUpload: false,
  chunkSize: 4096
};

function getFilelist(): FileList {
  const file = getFile();
  return {
    0: file,
    1: file,
    2: file,
    3: file,
    length: 4,
    item: (index: number) => file
  };
}

function getFile(): File {
  return new File([''], 'filename.mp4');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('UploadxService', () => {
  let service: UploadxService;
  beforeEach(() => {
    service = new UploadxService(new NgZone({}));
  });

  it('should set default options', () => {
    service.init({});
    expect(service.options.endpoint).toEqual('/upload');
    expect(service.options.concurrency).toEqual(2);
    expect(service.options.autoUpload).toEqual(true);
  });
  it('should set endpoint', () => {
    service.init({ endpoint: ENDPOINT });
    expect(service.options.concurrency).toEqual(2);
    expect(service.options.autoUpload).toEqual(true);
    expect(service.options.endpoint).toEqual(ENDPOINT);
  });
  it('should overwrite default options', () => {
    service.init(options);
    expect(service.options.endpoint).toEqual(ENDPOINT);
    expect(service.options.token).toEqual('%token%');
    expect(service.options.chunkSize).toEqual(4096);
  });
  it('should keep the settings', () => {
    service.init(options);
    service.init({});
    service.connect();
    expect(service.options.endpoint).toEqual(ENDPOINT);
    expect(service.options.token).toEqual('%token%');
    expect(service.options.chunkSize).toEqual(4096);
  });
  it('should add 4 files to queue', () => {
    const fileList = getFilelist();
    service.connect(options);
    service.handleFileList(fileList);
    expect(service.queue.length).toEqual(4);
    service.disconnect();
    expect(service.queue.length).toEqual(0);
  });

  it('should add file to queue with status `added`', () => {
    const file = getFile();
    service.connect(options);
    service.handleFile(file);
    expect(service.queue[0].status).toEqual('added');
    service.disconnect();
  });
  it('should set correct status on `control` method call', () => {
    const file = getFile();
    service.connect(options);
    service.handleFile(file);
    const upload = service.queue[0];
    service.control({ action: 'pause' });
    expect(service.queue[0].status).toEqual('paused');
    service.control({ action: 'upload' });
    expect(service.queue[0].status).toEqual('queue');
    service.control({ ...upload, action: 'pause' });
    expect(service.queue[0].status).toEqual('paused');
    service.control({ ...upload, action: 'upload' });
    expect(service.queue[0].status).toEqual('queue');
    service.control({ ...upload, action: 'cancel' });
    service.control({ action: 'cancel' });
    service.control({ action: '???' as UploadAction });
    expect(service.queue[0].status).toEqual('cancelled');
    service.control({ action: 'upload' });
    expect(service.queue[0].status).toEqual('cancelled');
  });

  it('should add file to queue with status `queue`', () => {
    const file = getFile();
    service.connect({ ...options, autoUpload: true });
    service.handleFile(file);
    expect(service.queue[0].status).toEqual('queue');
    service.disconnect();
  });

  it('should limit concurrent uploads', async () => {
    service.connect({ ...options, autoUpload: true });
    service.handleFileList(getFilelist());
    await delay(100);
    expect(service.queue.map(f => f.status).filter(s => s !== 'queue').length).toEqual(3);
    expect(service.queue[3].status).toEqual('queue');
    service.disconnect();
  });

  it('should listen offline/online events', () => {
    const control = spyOn(service, 'control');
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
    expect(control).toHaveBeenCalledTimes(2);
  });
});
