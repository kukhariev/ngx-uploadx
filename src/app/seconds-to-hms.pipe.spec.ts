import { SecondsToHMSPipe } from './seconds-to-hms.pipe';

describe('SecondsToHmsPipe', () => {
  let pipe: SecondsToHMSPipe;

  beforeEach(() => {
    pipe = new SecondsToHMSPipe();
  });

  it('should transform 0 seconds to 00:00:00', () => {
    expect(pipe.transform(0)).toBe('00:00:00');
  });

  it('should transform 3661 seconds to 01:01:01', () => {
    expect(pipe.transform(3661)).toBe('01:01:01');
  });

  it('should transform 86399 seconds to 23:59:59', () => {
    expect(pipe.transform(86399)).toBe('23:59:59');
  });

  it('should handle 24 hours (86400 seconds) as 24:00:00', () => {
    expect(pipe.transform(86400)).toBe('24:00:00');
  });

  it('should return default value for NaN input', () => {
    expect(pipe.transform(NaN)).toBe('....');
  });

  it('should return custom default value for NaN input', () => {
    expect(pipe.transform(NaN, 'Invalid')).toBe('Invalid');
  });

  it('should return default value for Infinity', () => {
    expect(pipe.transform(Infinity)).toBe('....');
  });

  it('should handle negative values', () => {
    expect(pipe.transform(-3661)).toBe('01:01:01');
  });

  it('should handle floating point numbers', () => {
    expect(pipe.transform(3661.7)).toBe('01:01:01');
  });

  it('should handle string input', () => {
    expect(pipe.transform('3661')).toBe('01:01:01');
  });
});
