import { UploaderX, getRangeEnd } from './uploaderx';
import { UploadxOptions } from './interfaces';
import { Uploader } from './uploader';

describe('Uploader', () => {
  it('should set to adaptive chunkSize if no options are specified', async function() {
    const file = getFile();
    const uploader: Uploader = new UploaderX(file, {} as UploadxOptions);
    expect(uploader.chunkSize).toEqual(4096 * 64);
  });
  it('should set fixed chunkSize', async function() {
    const file = getFile();
    const uploader: Uploader = new UploaderX(file, { chunkSize: 4_194_304 } as UploadxOptions);
    expect(uploader.chunkSize).toEqual(4_194_304);
  });
  it('should upload', async function() {
    const file = getFile();
    const uploader: Uploader = new UploaderX(file, {
      token: () => Promise.resolve('_token_')
    } as UploadxOptions);
    await uploader.upload();
    expect(uploader.responseStatus).toEqual(404);
    expect(uploader.headers.Authorization).toBeDefined();
  });
});

describe('getRangeEnd', () => {
  it('invalid ranges', () => {
    expect(getRangeEnd(undefined)).toEqual(-1);
    expect(getRangeEnd('')).toEqual(-1);
    expect(getRangeEnd('-invalid-')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=-1')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=-5')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=0--5')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=0--1')).toEqual(-1);
  });
  it('valid ranges', () => {
    expect(getRangeEnd('Range: bytes=0-1')).toEqual(1);
    expect(getRangeEnd('Range: bytes=0-0')).toEqual(0);
    expect(getRangeEnd('Range: bytes=0-100')).toEqual(100);
  });
});

function getFile(): File {
  return new File([''], 'filename.mp4');
}
