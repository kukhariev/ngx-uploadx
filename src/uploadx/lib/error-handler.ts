export enum ErrorType {
  NotFound,
  Auth,
  Retryable,
  Fatal
}

/**
 * Retryable ErrorHandler
 */
export class ErrorHandler {
  /** Maximum number of retry attempts */
  static maxAttempts = 8;
  /** Upload not exist status codes */
  static shouldRestartCodes = [404, 410];
  /** Bad token? status codes */
  static authErrorCodes = [401];
  /** Retryable 4xx status codes */
  static shouldRetryCodes = [423, 429];
  static minDelay = 500;
  static maxDelay = ErrorHandler.minDelay * 120;
  static factor = 2;
  public attempts = 0;
  private delay: number = ErrorHandler.minDelay;
  private code = -1;

  kind(code: number): ErrorType {
    code !== this.code && this.reset();
    this.code = code;
    this.attempts++;

    if (this.attempts >= ErrorHandler.maxAttempts) {
      return ErrorType.Fatal;
    }
    if (ErrorHandler.authErrorCodes.indexOf(code) !== -1) {
      return ErrorType.Auth;
    }
    if (ErrorHandler.shouldRestartCodes.indexOf(code) !== -1) {
      return ErrorType.NotFound;
    }
    if (code < 400 || code >= 500 || ErrorHandler.shouldRetryCodes.indexOf(code) !== -1) {
      return ErrorType.Retryable;
    }
    return ErrorType.Fatal;
  }

  wait(): Promise<number> {
    return new Promise(resolve => {
      this.delay = Math.min(this.delay * ErrorHandler.factor, ErrorHandler.maxDelay);
      setTimeout(
        () => resolve(this.attempts),
        this.delay + Math.floor(Math.random() * ErrorHandler.minDelay)
      );
    });
  }

  reset(): void {
    this.delay = ErrorHandler.minDelay;
    this.attempts = 0;
    this.code = -1;
  }
}
