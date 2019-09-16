import { BackoffRetry } from './backoff_retry';

describe('BackoffRetry', function() {
  describe('constructor', function() {
    it('should set to defaults if no parameters are specified', async function() {
      const bf: any = new BackoffRetry();
      expect(bf.attempts).toBe(1);
      expect(bf.min).toBe(500);
      expect(bf.max).toBe(60_000);
    });
    it('should set custom params', async () => {
      const bf: any = new BackoffRetry(100, 10_000);
      expect(bf.attempts).toBe(1);
      expect(bf.min).toBe(100);
      expect(bf.max).toBe(10_000);
    });
  });
  describe('methods', () => {
    const bf = new BackoffRetry(100, 10_000);
    it('should increase retryAttempts', async function() {
      const f = await bf.wait(500);
      expect(f).toBe(1);
      const s = await bf.wait(500);
      expect(s).toBe(2);
    });
    it('should reset retryAttempts', async function() {
      bf.reset();
      expect(bf.attempts).toBe(1);
    });
  });
});
