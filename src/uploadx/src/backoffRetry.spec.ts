import { BackoffRetry } from './backoffRetry';

describe('BackoffRetry', function() {
  describe('constructor', function() {
    it('defaults', async function() {
      const bf: any = new BackoffRetry();
      expect(bf.retryAttempts).toBe(1);
      expect(bf.min).toBe(200);
      expect(bf.max).toBe(60_000);
      expect(bf.k).toBe(2);
    });
    it('custom', async function() {
      const bf: any = new BackoffRetry(100, 10_000, 1.41);
      expect(bf.retryAttempts).toBe(1);
      expect(bf.min).toBe(100);
      expect(bf.max).toBe(10_000);
      expect(bf.k).toBe(1.41);
    });
  });
  describe('methods', function() {
    const bf = new BackoffRetry(100, 10_000, 1.41);
    it('wait', async function() {
      const f = await bf.wait(500);
      expect(f).toBe(1);
      const s = await bf.wait(500);
      expect(s).toBe(2);
    });
    it('reset', async function() {
      bf.reset();
      expect(bf.retryAttempts).toBe(1);
    });
  });
});
