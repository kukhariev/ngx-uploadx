/**
 * @internal
 */
export enum ErrorType {
  NotFound,
  Auth,
  Retryable,
  Fatal
}

/**
 * @internal
 */
export class ErrorHandler {
  static maxAttempts = 8;
  static shouldRestartCodes = [404, 410];
  static authErrorCodes = [401];
  static shouldRetryCodes = [423, 429];
  static min = 500;
  static max = ErrorHandler.min * 120;
  static factor = 2;
  public attempts = 0;
  private delay: number = ErrorHandler.min;
  private code? = -1;

  kind(code: number): ErrorType {
    if (code === this.code) {
      this.attempts++;
      if (this.attempts >= ErrorHandler.maxAttempts) {
        return ErrorType.Fatal;
      }
    } else {
      this.reset();
    }
    this.code = code;

    if (ErrorHandler.authErrorCodes.includes(code)) {
      return ErrorType.Auth;
    }
    if (ErrorHandler.shouldRestartCodes.includes(code)) {
      return ErrorType.NotFound;
    }
    if (code < 400 || code >= 500 || ErrorHandler.shouldRetryCodes.includes(code)) {
      return ErrorType.Retryable;
    }
    return ErrorType.Fatal;
  }

  wait(): Promise<number> {
    return new Promise(resolve => {
      this.delay = Math.min(this.delay * ErrorHandler.factor, ErrorHandler.max);
      setTimeout(
        () => resolve(this.attempts),
        this.delay + Math.floor(Math.random() * ErrorHandler.min)
      );
    });
  }

  reset(): void {
    this.delay = ErrorHandler.min;
    this.attempts = 0;
    this.code = -1;
  }
}
