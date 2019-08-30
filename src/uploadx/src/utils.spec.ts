import { resolveUrl } from './utils';
const _URL = window.URL;
const base = 'http://www.example.com/upload';
const rel = '/upload?upload_id=12345';
const abs = 'http://www.example.com/upload?upload_id=12345';
const path = 'files?upload_id=12345';

describe('resolveUrl', () => {
  it('absolute', () => {
    const resolved = resolveUrl(abs, base);
    expect(resolved).toBe('http://www.example.com/upload?upload_id=12345');
  });
  it('relative', () => {
    const resolved = resolveUrl(rel, base);
    expect(resolved).toBe('http://www.example.com/upload?upload_id=12345');
  });
  it('path', () => {
    const resolved = resolveUrl(path, base);
    expect(resolved).toBe('http://www.example.com/files?upload_id=12345');
  });
});
describe('resolveUrl:polyfill', function() {
  it('relative', () => {
    const resolved = resolveUrl(rel, base);
    expect(resolved).toBe('http://www.example.com/upload?upload_id=12345');
  });
  it('path', () => {
    const resolved = resolveUrl(path, base);
    expect(resolved).toBe('http://www.example.com/files?upload_id=12345');
  });
  afterEach(() => {
    window.URL = _URL;
  });
});
