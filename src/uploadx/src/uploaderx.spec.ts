import { getRangeEnd } from './uploaderx';

describe('getRangeEnd', () => {
  it('invalid ranges', () => {
    expect(getRangeEnd(undefined)).toEqual(-1);
    expect(getRangeEnd('')).toEqual(-1);
    expect(getRangeEnd('-invalid-')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=-1')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=-5')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=0--5')).toEqual(-1);
    expect(getRangeEnd('Range: bytes=0--1')).toEqual(-1);
  });
  it('valid ranges', () => {
    expect(getRangeEnd('Range: bytes=0-1')).toEqual(1);
    expect(getRangeEnd('Range: bytes=0-0')).toEqual(0);
    expect(getRangeEnd('Range: bytes=0-100')).toEqual(100);
  });
});
