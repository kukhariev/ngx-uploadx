import { XHRFactory } from './xhrfactory';

let xhr: XMLHttpRequest;

describe('XHRFactory', () => {
  beforeEach(() => {
    xhr = XHRFactory.getInstance();
  });
  it('pool size must be 0', () => {
    expect(XHRFactory.size).toBe(0);
  });
  it('open called', () => {
    spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();
    spyOn(XMLHttpRequest.prototype, 'send');
    xhr.open('GET', 'http:/localhost');
    xhr.abort();
    expect(XMLHttpRequest.prototype.open).toHaveBeenCalled();
  });
  it('onload === function', () => {
    xhr.onload = () => console.log(xhr.status);
    expect(typeof xhr.onload).toBe('function');
  });
  it('onload === null', () => {
    expect(xhr.onload).toBeNull();
  });
  afterEach(() => {
    xhr.abort();
    XHRFactory.release(xhr);
  });

});
