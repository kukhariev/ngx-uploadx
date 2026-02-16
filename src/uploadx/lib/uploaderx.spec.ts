import { describe, expect, it, vi, type Mock } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajax } from './ajax';
import { getRangeEnd, UploaderX } from './uploaderx';

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
const fileWithoutType = new File([''], 'filename');

describe('UploaderX', () => {
  describe('getFileUrl', () => {
    let uploaderX: UploaderX;
    let req: Mock;
    let getValueFromResponse: any;

    it('should set headers', async () => {
      uploaderX = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
      req = vi.spyOn(uploaderX, 'request').mockImplementation(async ({ headers }: any) => {
        expect(headers['X-Upload-Content-Type']).toEqual('text/plain');
        expect(headers['X-Upload-Content-Length']).toEqual(6);
      });
      getValueFromResponse = vi
        .spyOn(uploaderX, 'getValueFromResponse' as any)
        .mockReturnValue('/12345678');
      expect(uploaderX.name).toEqual('filename.txt');
      expect(uploaderX.size).toEqual(6);
      expect(await uploaderX.getFileUrl()).toEqual('/12345678');
      expect(req).toHaveBeenCalled();
      expect(getValueFromResponse).toHaveBeenCalled();
    });

    it('should set default type header', async () => {
      uploaderX = new UploaderX(fileWithoutType, {}, () => {}, {} as Ajax);
      req = vi.spyOn(uploaderX, 'request').mockImplementation(async ({ headers }: any) => {
        expect(headers['X-Upload-Content-Type']).toEqual('application/octet-stream');
        expect(headers['X-Upload-Content-Length']).toEqual(0);
      });
      getValueFromResponse = vi
        .spyOn(uploaderX as any, 'getValueFromResponse')
        .mockReturnValue('/12345678');
      expect(uploaderX.name).toEqual('filename');
      expect(uploaderX.size).toEqual(0);
      await uploaderX.getFileUrl();
      expect(req).toHaveBeenCalled();
      expect(getValueFromResponse).toHaveBeenCalled();
    });
  });

  describe('sendFileContent', () => {
    let uploaderX: UploaderX;
    let req: Mock;
    let getValueFromResponse: any;

    it('should send chunk and return offset', async () => {
      uploaderX = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
      uploaderX.offset = 0;
      req = vi.spyOn(uploaderX, 'request').mockImplementation(async ({ headers }: any) => {
        expect(headers['Content-Type']).toEqual('application/octet-stream');
        expect(headers['Content-Range']).toEqual('bytes 0-5/6');
      });
      getValueFromResponse = vi
        .spyOn(uploaderX as any, 'getValueFromResponse')
        .mockReturnValue('Range: bytes=0-5');
      uploaderX.responseStatus = 308;
      expect(await uploaderX.sendFileContent()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getValueFromResponse).toHaveBeenCalled();
    });
  });

  describe('getOffset', () => {
    let uploaderX: UploaderX;
    let req: Mock;
    let getValueFromResponse: any;

    it('should return offset', async () => {
      uploaderX = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
      uploaderX.offset = 0;
      req = vi.spyOn(uploaderX, 'request').mockImplementation(async ({ headers }: any) => {
        expect(headers['Content-Range']).toEqual('bytes */6');
      });
      getValueFromResponse = vi
        .spyOn(uploaderX as any, 'getValueFromResponse')
        .mockReturnValue('Range: bytes=0-5');
      uploaderX.responseStatus = 308;
      expect(await uploaderX.getOffset()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getValueFromResponse).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    let uploaderX: UploaderX;
    let req: Mock;
    let getValueFromResponse: any;

    it('should send updated data and return location', async () => {
      uploaderX = new UploaderX(fileWithType, {}, () => {}, {} as Ajax);
      req = vi.spyOn(uploaderX, 'request').mockImplementation(async ({ body, method }: any) => {
        expect(body).toEqual('{"metadata":{"updated":true}}');
        expect(method).toEqual('PATCH');
      });
      getValueFromResponse = vi
        .spyOn(uploaderX as any, 'getValueFromResponse')
        .mockReturnValue('/12345678');
      expect(await uploaderX.update({ metadata: { updated: true } })).toEqual('/12345678');
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
});
