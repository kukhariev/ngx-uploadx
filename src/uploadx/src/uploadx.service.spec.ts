import { UploadxService } from './uploadx.service';

const options = {
  concurrency: 3,
  allowedTypes: 'image/*,video/*',
  endpoint: `http://localhost:3003/upload/?user_id=test`,
  token: 'iamtoken',
  autoUpload: false,
  chunkSize: 1024 * 256 * 8,
  headers: (f: File) => ({ 'Content-Disposition': `filename=${encodeURI(f.name)}` })
};
describe('UploadxService', () => {
  let service: UploadxService;

  beforeEach(() => {
    service = new UploadxService();
  });

  it('#init should overwrite default options', () => {
    service.init(options);
    expect(service.uploaderOptions.endpoint).toEqual(`http://localhost:3003/upload/?user_id=test`);
    expect(service.uploaderOptions.token).toEqual('iamtoken');
    expect(service.uploaderOptions.chunkSize).toEqual(1024 * 256 * 8);
  });
});
