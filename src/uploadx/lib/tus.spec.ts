import { Tus } from './tus';

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
describe('getFileUrl', () => {
  let upx: Tus;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    upx = new Tus(fileWithType, {});
    req = spyOn<any>(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Upload-Metadata']).toContain('name');
      expect(headers['Upload-Length']).toEqual('6');
    });
    getValueFromResponse = spyOn<any>(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename.txt');
    expect(upx.size).toEqual(6);
    expect(await upx.getFileUrl()).toEqual('/12345678');
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});
describe('sendFileContent', () => {
  let upx: Tus;
  let req: jasmine.Spy;
  let getOffsetFromResponse: jasmine.Spy;
  it('should set Upload-Offset header', async () => {
    upx = new Tus(fileWithType, {});
    req = spyOn<any>(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/offset+octet-stream');
      expect(headers['Upload-Offset']).toEqual('0');
    });
    getOffsetFromResponse = spyOn<any>(upx, 'getOffsetFromResponse').and.returnValue(6);
    expect(await upx.sendFileContent()).toEqual(6);
    expect(req).toHaveBeenCalled();
    expect(getOffsetFromResponse).toHaveBeenCalled();
  });
});
