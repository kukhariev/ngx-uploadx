import { Ajax } from './ajax';
import { getRangeEnd, UploaderX } from './uploaderx';
// tslint:disable: no-any

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
const fileWithoutType = new File([''], 'filename');

describe('getFileUrl', () => {
  let uploader: UploaderX;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    uploader = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
    req = spyOn<any>(uploader, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('text/plain');
      expect(headers['X-Upload-Content-Length']).toEqual('6');
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
  it('should set default type header', async () => {
    uploader = new UploaderX(fileWithoutType, {}, () => {}, {} as Ajax);
    req = spyOn<any>(uploader, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('application/octet-stream');
      expect(headers['X-Upload-Content-Length']).toEqual('0');
    });
    getValueFromResponse = spyOn<any>(uploader, 'getValueFromResponse').and.returnValue(
      '/12345678'
    );
    expect(uploader.name).toEqual('filename');
    expect(uploader.size).toEqual(0);
    await uploader.getFileUrl();
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});

describe('sendFileContent', () => {
  let uploaderX: UploaderX;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set Content-Range header', async () => {
    uploaderX = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
    uploaderX.offset = 0;
    req = spyOn<any>(uploaderX, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/octet-stream');
      expect(headers['Content-Range']).toEqual('bytes 0-5/6');
    });
    getValueFromResponse = spyOn<any>(uploaderX, 'getValueFromResponse').and.returnValue(
      'Range: bytes=0-5'
    );
    uploaderX.responseStatus = 308;
    expect(await uploaderX.sendFileContent()).toEqual(6);
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});

describe('getRangeEnd', () => {
  it('invalid ranges', () => {
    expect(getRangeEnd(undefined)).toEqual(-1);
    expect(getRangeEnd('')).toEqual(-1);
    expect(getRangeEnd('-invalid-')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=0--1')).toEqual(-1);
  });
  it('valid ranges', () => {
    expect(getRangeEnd('Range: bytes=0-1')).toEqual(1);
    expect(getRangeEnd('Range: bytes=0-0')).toEqual(0);
    expect(getRangeEnd('Range: bytes=0-100')).toEqual(100);
    expect(getRangeEnd('Range: bytes=10-100')).toEqual(100);
  });
});
