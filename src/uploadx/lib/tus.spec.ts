// tslint:disable: no-any
import { Ajax } from './ajax';
import { DynamicChunk } from './dynamic-chunk';
import { Tus } from './tus';

const chunk = new DynamicChunk();

const fileWithType = new File(['123456'], 'filename.txt', { type: 'text/plain' });
describe('getFileUrl', () => {
  let tus: Tus | any;
  let req: jasmine.Spy;
  let getValueFromResponse: jasmine.Spy;
  it('should set headers', async () => {
    tus = new Tus(fileWithType, {}, () => {}, {} as Ajax, chunk);
    req = spyOn<Tus>(tus, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Upload-Metadata']).toContain('name');
      expect(headers['Upload-Length']).toEqual('6');
    });
    getValueFromResponse = spyOn(tus, 'getValueFromResponse').and.returnValue('/12345678');
    expect(tus.name).toEqual('filename.txt');
    expect(tus.size).toEqual(6);
    expect(await tus.getFileUrl()).toEqual('/12345678');
    expect(req).toHaveBeenCalled();
    expect(getValueFromResponse).toHaveBeenCalled();
  });
});

describe('sendFileContent', () => {
  let tus: Tus | any;
  let req: jasmine.Spy;
  let getOffsetFromResponse: jasmine.Spy;
  it('should set Upload-Offset header', async () => {
    tus = new Tus(fileWithType, {}, () => {}, {} as Ajax, chunk);
    req = spyOn<Tus>(tus, 'request').and.callFake(({ headers }: any) => {
      expect(headers['Content-Type']).toEqual('application/offset+octet-stream');
      expect(headers['Upload-Offset']).toEqual('0');
    });
    getOffsetFromResponse = spyOn<Tus>(tus, 'getOffsetFromResponse').and.returnValue(6);
    expect(await tus.sendFileContent()).toEqual(6);
    expect(req).toHaveBeenCalled();
    expect(getOffsetFromResponse).toHaveBeenCalled();
  });
});
