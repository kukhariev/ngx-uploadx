import { b64, resolveUrl } from './utils';
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
describe('resolveUrl:polyfill', () => {
  beforeAll(() => {
    window.URL = undefined as any;
  });
  it('relative', () => {
    const resolved = resolveUrl(rel, base);
    expect(resolved).toBe('http://www.example.com/upload?upload_id=12345');
  });
  it('path', () => {
    const resolved = resolveUrl(path, base);
    expect(resolved).toBe('http://www.example.com/files?upload_id=12345');
  });
  afterAll(() => {
    window.URL = _URL;
  });
});

fdescribe('b64', () => {
  const data = {
    name: 'спутник.mp4',
    lastModified: '1437390138231'
  };
  const encoded = 'name 0YHQv9GD0YLQvdC40LoubXA0,lastModified MTQzNzM5MDEzODIzMQ==';
  it('serialize', async () => {
    expect(b64.serialize(data)).toBe(encoded);
  });
  it('parse', async () => {
    expect(b64.parse(encoded)).toEqual(data);
  });
});
