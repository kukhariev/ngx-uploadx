import { ErrorHandler } from './error-handler';

describe('ErrorHandler', () => {
  describe('constructor', () => {
    it('should set to defaults if no parameters are specified', () => {
      const errorHandler = new ErrorHandler();
      expect(errorHandler.attempts).toBe(1);
      expect(errorHandler.min).toBe(500);
      expect(errorHandler.max).toBe(60_000);
    });
  });
});
