import { ErrorType, RetryHandler } from './retry-handler';

describe('RetryHandler', () => {
  let retry: RetryHandler;
  beforeEach(() => {
    retry = new RetryHandler();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

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

  it('checkForStall resets attempts on new value', () => {
    retry.config.maxAttempts = 2;
    retry.checkForStall('value1');
    expect(retry.attempts).toBe(0);
    retry.kind(500);
    expect(retry.attempts).toBe(1);
    retry.checkForStall('value2'); // new value resets attempts
    expect(retry.attempts).toBe(0);
  });

  it('wait()', async () => {
    const wait = retry.wait();
    vi.advanceTimersByTime(1001);
    await wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
    });
  });

  it('wait(time)', async () => {
    const wait = retry.wait(30000);
    vi.advanceTimersByTime(30001);
    await wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
    });
  });

  it('wait cancel()', async () => {
    const wait = retry.wait(30000);
    vi.advanceTimersByTime(1);
    retry.cancel();
    await wait.then(() => {
      expect(retry.kind(500)).toBe(ErrorType.Retryable);
    });
  });

  it('should detect stalled upload (same offset)', () => {
    expect(retry.checkForStall(0)).toBe(false);
    expect(retry.checkForStall(0)).toBe(false);
    expect(retry.checkForStall(0)).toBe(false);
    expect(retry.checkForStall(0)).toBe(true);
  });

  it('should reset stalled counter when offset changes', () => {
    expect(retry.checkForStall(0)).toBe(false);
    expect(retry.checkForStall(0)).toBe(false);
    expect(retry.checkForStall(100)).toBe(false);
    expect(retry.checkForStall(100)).toBe(false);
    expect(retry.checkForStall(100)).toBe(false);
    expect(retry.checkForStall(100)).toBe(true);
  });

  it('should not count undefined as stalled', () => {
    expect(retry.checkForStall(undefined)).toBe(false);
    expect(retry.checkForStall(undefined)).toBe(false);
    expect(retry.checkForStall(undefined)).toBe(false);
    expect(retry.checkForStall(undefined)).toBe(false);
  });
});
