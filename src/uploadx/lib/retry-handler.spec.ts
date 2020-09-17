import { ErrorType, RetryHandler } from './retry-handler';

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
});
