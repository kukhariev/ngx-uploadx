import { b64, isNumber, resolveUrl } from './utils';
const urlTestData = [
  ['https://a/b/c', 'https://d/e/f?g=1', 'https://d/e/f?g=1'],
  ['http://a/b/c', 'https://d/e/f?g=2', 'https://d/e/f?g=2'],
  ['https://a/b/c', '//d/e/f?g=3', 'https://d/e/f?g=3'],
  ['http://a/b/c', '//d/e/f?g=4', 'http://d/e/f?g=4'],
  ['https://a/b/c', '/d/e?f=5', 'https://a/d/e?f=5'],
  ['https://a/b/c', 'd/e?f=6', 'https://a/b/d/e?f=6'],
  ['/b/c', '//d/e/f?g=7', '//d/e/f?g=7'],
  ['/b/c', '/d/e?f=8', '/d/e?f=8'],
  ['/b/c', 'd/e?f=9', '/b/d/e?f=9']
];
describe('resolveUrl', () => {
  it('resolveUrl', () => {
    urlTestData.forEach(([base, url, expected]) => {
      expect(resolveUrl(url, base)).toBe(expected);
    });
  });
});

describe('b64', () => {
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

describe('primitives', () => {
  it('isNumber', () => {
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(false)).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber('NaN')).toBe(false);
    expect(isNumber('')).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber(0)).toBe(true);
  });
});
