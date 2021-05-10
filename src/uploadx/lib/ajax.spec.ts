import { UploadxAjax } from './ajax';

const data = { key0: '0', key1: '1' };
const mockXHR = {
  DONE: 0,
  HEADERS_RECEIVED: 0,
  LOADING: 0,
  OPENED: 0,
  UNSENT: 0,
  getResponseHeader(name: string): string | null {
    return null;
  },
  onabort(): void {},
  onerror(): void {},
  onload(): void {},
  onloadend(): void {},
  onprogress(): void {},
  onreadystatechange(): void {},
  ontimeout(): void {},
  readyState: 0,
  responseText: JSON.stringify(data),
  responseType: '',
  responseURL: '',
  setRequestHeader(name: string, value: string): void {},
  status: 200,
  statusText: 'OK',
  timeout: 0,
  withCredentials: false,
  upload: { onprogress: (evt: ProgressEvent) => {} },
  abort(): void {},
  open(): void {},
  send: () => {
    setTimeout(() => {
      mockXHR.onload && mockXHR.onload({} as ProgressEvent);
    });
  },
  getAllResponseHeaders: () => `key0: 0\r\nkey1: 1\r\n`,
  response: JSON.stringify(data)
} as unknown as XMLHttpRequest;

describe('Ajax', () => {
  let ajax: UploadxAjax;
  beforeEach(() => {
    ajax = new UploadxAjax(() => mockXHR);
  });
  it('getResponseHeaders', () => {
    const headers = ajax.getResponseHeaders(mockXHR);
    expect(headers).toEqual(data);
  });
  it('getResponseBody', () => {
    const body = ajax.getResponseBody<string>(mockXHR);
    expect(body).toEqual(JSON.stringify(data));
  });
  it('request', async () => {
    const res = await ajax.request({ url: '/upload', responseType: 'json' });
    expect(res).toEqual(jasmine.objectContaining({ status: 200, headers: data, data }));
  });
});
