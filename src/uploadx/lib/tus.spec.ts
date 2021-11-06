import { Ajax } from './ajax';
import { Tus } from './tus';

/* eslint-disable @typescript-eslint/no-explicit-any */
const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
describe('getFileUrl', () => {
  let uploader: Tus;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
    req = spyOn<any>(uploader, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Upload-Metadata']).toContain('name');
      expect(headers['Upload-Length']).toEqual('6');
    });
    getValueFromResponse = spyOn<any>(uploader, 'getValueFromResponse').and.returnValue(
      '/12345678'
    );
    expect(uploader.name).toEqual('filename.txt');
    expect(uploader.size).toEqual(6);
    expect(await uploader.getFileUrl()).toEqual('/12345678');
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});
describe('sendFileContent', () => {
  let uploader: Tus;
  let req: jasmine.Spy;
  let getOffsetFromResponse: jasmine.Spy;
  it('should set Upload-Offset header', async () => {
    uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
    uploader.offset = 0;
    req = spyOn<any>(uploader, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/offset+octet-stream');
      expect(headers['Upload-Offset']).toEqual('0');
    });
    getOffsetFromResponse = spyOn<any>(uploader, 'getOffsetFromResponse').and.returnValue(6);
    expect(await uploader.sendFileContent()).toEqual(6);
    expect(req).toHaveBeenCalled();
    expect(getOffsetFromResponse).toHaveBeenCalled();
  });
});
