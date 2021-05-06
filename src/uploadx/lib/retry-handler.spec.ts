import { ErrorType, RetryHandler, ShouldRetryFunction } from './retry-handler';

describe('ErrorHandler', () => {
  it('ErrorHandler.kind(status)', () => {
    const errorHandler = new RetryHandler();
    expect(errorHandler.kind(400)).toBe(ErrorType.Fatal);
    expect(errorHandler.kind(0)).toBe(ErrorType.Retryable);
    expect(errorHandler.kind(500)).toBe(ErrorType.Retryable);
    expect(errorHandler.kind(423)).toBe(ErrorType.Retryable);
    expect(errorHandler.kind(200)).toBe(ErrorType.Retryable);
    expect(errorHandler.kind(404)).toBe(ErrorType.NotFound);
    expect(errorHandler.kind(401)).toBe(ErrorType.Auth);
  });

  it('Custom shouldRetry', () => {
    const shouldRetry: ShouldRetryFunction = (code, attempts) => code === 500 && attempts < 2;
    const errorHandler = new RetryHandler({ shouldRetry });
    expect(errorHandler.kind(500)).toBe(ErrorType.Retryable);
    errorHandler.attempts = 3;
    expect(errorHandler.kind(500)).toBe(ErrorType.Fatal);
  });
});
