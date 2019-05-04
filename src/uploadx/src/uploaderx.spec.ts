import { UploaderX } from './uploaderx';
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

function getFile(): File {
  return new File([''], 'filename.mp4');
}
