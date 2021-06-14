import { DynamicChunk } from './dynamic-chunk';

describe('DynamicChunk', () => {
  let chunk: DynamicChunk;
  beforeEach(() => {
    chunk = new DynamicChunk();
  });

  it('scale', () => {
    const initSize = chunk.initialChunkSize;
    expect(chunk.scale(0)).toEqual(initSize / 2);
    expect(chunk.scale(0)).toEqual(initSize / 4);
    expect(chunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(initSize / 2);
    expect(chunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(initSize);
    expect(chunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(initSize * 2);
    expect(chunk.scale(undefined as unknown as number)).toEqual(initSize * 2);
  });

  it('fixed chunkSize', () => {
    chunk.chunkSize = 512;
    expect(chunk.size).toEqual(512);
    expect(chunk.scale(Number.MAX_SAFE_INTEGER)).toEqual(512);
  });

  it('no chunks', () => {
    const max = chunk.maxChunkSize;
    chunk.chunkSize = 0;
    expect(chunk.size).toEqual(max);
  });
});
