// tslint:disable: no-any
import { Ajax } from './ajax';
import { DynamicChunk } from './dynamic-chunk';
import { getRangeEnd, UploaderX } from './uploaderx';

const chunk = new DynamicChunk();

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
const fileWithoutType = new File([''], 'filename');

describe('getFileUrl', () => {
  let upx: UploaderX | any;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    upx = new UploaderX(fileWithType, {}, () => {}, {} as Ajax, chunk);
    req = spyOn(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('text/plain');
      expect(headers['X-Upload-Content-Length']).toEqual('6');
    });
    getValueFromResponse = spyOn(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename.txt');
    expect(upx.size).toEqual(6);
    expect(await upx.getFileUrl()).toEqual('/12345678');
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
  it('should set default type header', async () => {
    upx = new UploaderX(fileWithoutType, {}, () => {}, {} as Ajax, chunk);
    req = spyOn(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['X-Upload-Content-Type']).toEqual('application/octet-stream');
      expect(headers['X-Upload-Content-Length']).toEqual('0');
    });
    getValueFromResponse = spyOn(upx, 'getValueFromResponse').and.returnValue('/12345678');
    expect(upx.name).toEqual('filename');
    expect(upx.size).toEqual(0);
    await upx.getFileUrl();
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});

describe('sendFileContent', () => {
  let upx: UploaderX | any;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set Content-Range header', async () => {
    upx = new UploaderX(fileWithType, {}, () => {}, {} as Ajax, chunk);
    req = spyOn(upx, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/octet-stream');
      expect(headers['Content-Range']).toEqual('bytes 0-5/6');
    });
    getValueFromResponse = spyOn(upx, 'getValueFromResponse').and.returnValue('Range: bytes=0-5');
    upx.responseStatus = 308;
    expect(await upx.sendFileContent()).toEqual(6);
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
