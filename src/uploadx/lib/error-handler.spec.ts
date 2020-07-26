import { ErrorHandler } from './error-handler';

describe('ErrorHandler', () => {
  it('should set to defaults if no parameters are specified', () => {
    const errorHandler = new ErrorHandler();
    expect(errorHandler.attempts).toBe(0);
    expect(ErrorHandler.min).toBe(500);
    expect(ErrorHandler.max).toBe(60_000);
  });
});
