import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { UploadAction } from './interfaces';
import { UploadxOptions } from './options';
import { UploaderX } from './uploaderx';
import { UploadxService } from './uploadx.service';

class MockUploader extends UploaderX {
  async upload(): Promise<void> {
    this.status = 'uploading';
  }
}

const ENDPOINT = `http://localhost:3003/upload?user_id=test`;
const options: UploadxOptions = {
  concurrency: 3,
  allowedTypes: 'image/*,video/*',
  endpoint: ENDPOINT,
  token: '%token%',
  autoUpload: false,
  chunkSize: 4096,
  uploaderClass: MockUploader
};

function getFileList(): FileList {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(getFile());
  dataTransfer.items.add(getFile());
  dataTransfer.items.add(getFile());
  dataTransfer.items.add(getFile());
  return dataTransfer.files;
}

function getFile(): File {
  return new File([''], 'filename.mp4');
}

describe('UploadxService', () => {
  let service: UploadxService;
  let sub: Subscription;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UploadxService] });
    service = TestBed.inject(UploadxService);
  });
  afterEach(() => {
    sub && sub.unsubscribe();
  });

  it('should set default options', () => {
    service.init({});
    expect(service.options.endpoint).toEqual('/upload');
    expect(service.options.concurrency).toEqual(2);
    expect(service.options.autoUpload).toEqual(true);
    expect(service.options.uploaderClass).toEqual(UploaderX);
  });

  it('should overwrite default options', () => {
    service.init(options);
    expect(service.options.endpoint).toEqual(ENDPOINT);
    expect(service.options.token).toEqual('%token%');
    expect(service.options.chunkSize).toEqual(4096);
    expect(service.options.uploaderClass).toEqual(MockUploader);
  });

  it('should keep the settings', () => {
    service.init(options);
    service.init({});
    service.connect();
    expect(service.options.endpoint).toEqual(ENDPOINT);
    expect(service.options.token).toEqual('%token%');
    expect(service.options.chunkSize).toEqual(4096);
  });

  it('should add file to queue with status `added`', done => {
    const file = getFile();
    sub = service.init(options).subscribe(({ status }) => {
      expect(status).toEqual('added');
      done();
    });
    service.handleFiles(file);
  });

  it('should add file to queue with status `queue`', done => {
    const file = getFile();
    sub = service
      .init({ ...options, autoUpload: true })
      .pipe(skip(1))
      .subscribe(({ status }) => {
        expect(status).toEqual('queue');
        done();
      });
    service.handleFiles(file);
  });

  it('should set the correct status on `control` method call', done => {
    sub = service.connect({ ...options, autoUpload: true }).subscribe(queue => {
      if (queue.length === 4) {
        const upload = service.queue[0];
        service.control({ action: 'pause' });
        expect(upload.status).toEqual('paused');
        service.control({ action: 'upload' });
        expect(upload.status).toEqual('queue');
        service.control({ ...upload, action: 'pause' });
        expect(upload.status).toEqual('paused');
        service.control({ ...upload, action: 'upload' });
        expect(upload.status).toEqual('queue');
        service.control({ ...upload, action: 'cancel' });
        service.control({ action: 'cancel' });
        service.control({ action: '???' as UploadAction });
        expect(upload.status).toEqual('cancelled');
        service.control({ action: 'upload' });
        expect(upload.status).toEqual('cancelled');
        done();
      }
    });
    service.handleFiles(getFileList());
  });

  it('should limit concurrent uploads', done => {
    sub = service.connect({ ...options, autoUpload: true }).subscribe(queue => {
      if (queue.length === 4) {
        expect(queue.map(({ status }) => status).filter(s => s === 'uploading').length).toEqual(3);
        done();
      }
    });
    service.handleFiles(getFileList());
  });

  it('should listen to offline/online events', () => {
    const control = spyOn(service, 'control');
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
    expect(control).toHaveBeenCalledTimes(2);
  });
});
