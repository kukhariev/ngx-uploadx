import { resolveUrl } from './resolve_url';

const base = 'http://www.example.com/upload/';
const loc = '/upload?upload_id=12345';

describe('resolveUrl', () => {
  it('basic', () => {
    const resolved = resolveUrl(loc, base);
    expect(resolved).toBe('http://www.example.com/upload?upload_id=12345');
  });
});
