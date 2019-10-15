import { getRangeEnd, UploaderX } from './uploaderx';

const file = new File([''], 'filename.mp4');
describe('getFileUrl', () => {
  let upx: UploaderX;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  beforeEach(() => {
    upx = new UploaderX(file, {});
  });
  it('should set headers', async () => {
    req = spyOn<any>(upx, 'request').and.callFake(function() {
      expect(arguments[0].headers['X-Upload-Content-Type']).toEqual('application/octet-stream');
    });
    getValueFromResponse = spyOn<any>(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename.mp4');
    expect(upx.size).toEqual(0);
    await upx.getFileUrl();
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
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
