import { UploaderX } from './uploaderx';
import { UploadxOptions } from './interfaces';

describe('Uploader', () => {
  it('should set to defaults if no options are specified', async function() {
    const file = getFile();
    const uploader = new UploaderX(file, {} as UploadxOptions);
    expect(uploader.chunkSize).toEqual(1_048_576);
  });
});

function getFile(): File {
  return new File([''], 'filename.mp4');
}
