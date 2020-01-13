import { getRangeEnd, UploaderX } from './uploaderx';

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
const fileWithoutType = new File([''], 'filename');
describe('getFileUrl', () => {
  let upx: UploaderX;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    upx = new UploaderX(fileWithType, {});
    req = spyOn<any>(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('text/plain');
      expect(headers['X-Upload-Content-Length']).toEqual('6');
    });
    getValueFromResponse = spyOn<any>(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename.txt');
    expect(upx.size).toEqual(6);
    expect(await upx.getFileUrl()).toEqual('/12345678');
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
  it('should set default type header', async () => {
    upx = new UploaderX(fileWithoutType, {});
    req = spyOn<any>(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('application/octet-stream');
      expect(headers['X-Upload-Content-Length']).toEqual('0');
    });
    getValueFromResponse = spyOn<any>(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename');
    expect(upx.size).toEqual(0);
    await upx.getFileUrl();
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});
describe('sendFileContent', () => {
  let upx: UploaderX;
  let req: jasmine.Spy;
  let getOffsetFromResponse: jasmine.Spy;
  it('should set Content-Range header', async () => {
    upx = new UploaderX(fileWithType, {});
    req = spyOn<any>(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/octet-stream');
      expect(headers['Content-Range']).toEqual('bytes 0-5/6');
    });
    getOffsetFromResponse = spyOn<any>(upx, 'getOffsetFromResponse').and.returnValue(6);
    expect(await upx.sendFileContent()).toEqual(6);
    expect(req).toHaveBeenCalled();
    expect(getOffsetFromResponse).toHaveBeenCalled();
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
