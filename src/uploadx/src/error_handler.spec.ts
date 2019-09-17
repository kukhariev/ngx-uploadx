import { ErrorHandler } from './error_handler';

describe('ErrorHandler', function() {
  describe('constructor', function() {
    it('should set to defaults if no parameters are specified', async function() {
      const bf: any = new ErrorHandler();
      expect(bf.attempts).toBe(1);
      expect(bf.min).toBe(500);
      expect(bf.max).toBe(60_000);
    });
  });
});
