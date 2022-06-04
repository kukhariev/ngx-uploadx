/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajax } from './ajax';
import { Tus } from './tus';

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
describe('Tus', () => {
  describe('getFileUrl', () => {
    let uploader: Tus;
    let req: jasmine.Spy;
    let getValueFromResponse: jasmine.Spy;
    it('should set headers', async () => {
      uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
      req = spyOn<any>(uploader, 'request').and.callFake(({ headers, method }: any) => {
        expect(headers['Upload-Metadata']).toContain('name');
        expect(headers['Upload-Length']).toEqual(6);
        expect(method).toBe('POST');
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
      req = spyOn<any>(uploader, 'request').and.callFake(({ headers, method }: any) => {
        expect(headers['Content-Type']).toEqual('application/offset+octet-stream');
        expect(method).toBe('PATCH');
      });
      getOffsetFromResponse = spyOn<any>(uploader, 'getOffsetFromResponse').and.returnValue(6);
      expect(await uploader.sendFileContent()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getOffsetFromResponse).toHaveBeenCalled();
    });
  });
  describe('getOffset', () => {
    let uploader: Tus;
    let req: jasmine.Spy;
    let getOffsetFromResponse: jasmine.Spy;
    it('should set Tus-Resumable header', async () => {
      uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
      req = spyOn<any>(uploader, 'request').and.callFake(({ method }: any) => {
        expect(method).toBe('HEAD');
      });
      getOffsetFromResponse = spyOn<any>(uploader, 'getOffsetFromResponse').and.returnValue(6);
      expect(await uploader.getOffset()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getOffsetFromResponse).toHaveBeenCalled();
    });
  });
});
