import { DynamicChunk } from './dynamic-chunk';

describe('DynamicChunk', () => {
  const init = DynamicChunk.size;
  it('scale', () => {
    expect(DynamicChunk.scale(0)).toEqual(init / 2);
    expect(DynamicChunk.scale(0)).toEqual(init / 4);
    expect(DynamicChunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(init / 2);
    expect(DynamicChunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(init);
    expect(DynamicChunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(init * 2);
    expect(DynamicChunk.scale(undefined as never)).toEqual(init * 2);
  });

  afterEach(() => {
    DynamicChunk.size = init;
  });
});
