import { ErrorType, RetryHandler } from './retry-handler';

describe('RetryHandler', () => {
  let retry: RetryHandler;
  beforeEach(() => {
    retry = new RetryHandler();
    jasmine.clock().install();
  });
  afterEach(() => jasmine.clock().uninstall());

  it('kind(status)', () => {
    expect(retry.kind(400)).toBe(ErrorType.Fatal);
    expect(retry.kind(0)).toBe(ErrorType.Retryable);
    expect(retry.kind(500)).toBe(ErrorType.Retryable);
    expect(retry.kind(423)).toBe(ErrorType.Retryable);
    expect(retry.kind(200)).toBe(ErrorType.Retryable);
    expect(retry.kind(404)).toBe(ErrorType.NotFound);
    expect(retry.kind(401)).toBe(ErrorType.Auth);
  });

  it('shouldRetry', () => {
    retry.config.shouldRetry = (code, attempts) => code === 500 && attempts < 2;
    expect(retry.kind(500)).toBe(ErrorType.Retryable);
    retry.attempts = 3;
    expect(retry.kind(500)).toBe(ErrorType.Fatal);
  });

  it('observe(offset)', () => {
    retry.config.maxAttempts = 2;
    retry.observe('same value');
    expect(retry.kind(500)).toBe(ErrorType.Retryable);
    retry.observe('same value');
    expect(retry.kind(500)).toBe(ErrorType.Retryable);
    retry.observe('same value');
    expect(retry.kind(500)).toBe(ErrorType.Fatal);
  });

  it('wait()', done => {
    const wait = retry.wait();
    jasmine.clock().tick(1001);
    wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
      done();
    });
  });

  it('wait(time)', done => {
    const wait = retry.wait(30_000);
    jasmine.clock().tick(30_001);
    wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
      done();
    });
  });

  it('wait cancel()', done => {
    const wait = retry.wait(30_000);
    jasmine.clock().tick(1);
    retry.cancel();
    wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
      done();
    });
  });
});
