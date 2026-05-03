/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Mock } from 'vitest';
import { Ajax } from './ajax';
import { Tus } from './tus';

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });

describe('Tus', () => {
  describe('getFileUrl', () => {
    let uploader: Tus;
    let req: Mock;
    it('should set headers', async () => {
      uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
      req = vi.spyOn(uploader, 'request').mockImplementation(async ({ headers, method }: any) => {
        expect(headers['Upload-Metadata']).toContain('name');
        expect(headers['Upload-Length']).toEqual(6);
        expect(method).toBe('POST');
      });
      const getValueFromResponse = vi
        .spyOn(uploader, 'getValueFromResponse' as any)
        .mockReturnValue('/12345678');
      expect(uploader.name).toEqual('filename.txt');
      expect(uploader.size).toEqual(6);
      expect(await uploader.getFileUrl()).toEqual('/12345678');
      expect(req).toHaveBeenCalled();
      expect(getValueFromResponse).toHaveBeenCalled();
    });
  });

  describe('sendFileContent', () => {
    let req: Mock;
    it('should set Upload-Offset header', async () => {
      const uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
      uploader.offset = 0;
      req = vi.spyOn(uploader, 'request').mockImplementation(async ({ headers, method }: any) => {
        expect(headers['Content-Type']).toEqual('application/offset+octet-stream');
        expect(method).toBe('PATCH');
      });
      const getOffsetFromResponse = vi
        .spyOn(uploader, 'getOffsetFromResponse' as any)
        .mockReturnValue(6);
      expect(await uploader.sendFileContent()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getOffsetFromResponse).toHaveBeenCalled();
    });
  });

  describe('getOffset', () => {
    let uploader: Tus;
    let req: Mock;
    it('should set Tus-Resumable header', async () => {
      uploader = new Tus(fileWithType, {}, () => {}, {} as Ajax);
      req = vi.spyOn(uploader, 'request').mockImplementation(async ({ method }: any) => {
        expect(method).toBe('HEAD');
      });
      const getOffsetFromResponse = vi
        .spyOn(uploader, 'getOffsetFromResponse' as any)
        .mockReturnValue(6);
      expect(await uploader.getOffset()).toEqual(6);
      expect(req).toHaveBeenCalled();
      expect(getOffsetFromResponse).toHaveBeenCalled();
    });
  });
});
