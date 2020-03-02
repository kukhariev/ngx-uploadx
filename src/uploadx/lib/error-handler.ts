/**
 * @internal
 */
export enum ErrorType {
  Restart,
  Auth,
  Retryable,
  FatalError
}
export class ErrorHandler {
  static maxAttempts = 8;
  static shouldRestartCodes = [404, 410];
  static authErrorCodes = [401];
  static shouldRetryCodes = [423, 429];
  min = 500;
  max = this.min * 120;
  factor = 2;
  attempts = 1;
  private delay: number;
  private code? = -1;

  constructor() {
    this.delay = this.min;
  }

  kind(code: number): ErrorType {
    if (code === this.code) {
      this.attempts++;
      if (this.attempts > ErrorHandler.maxAttempts) {
        return ErrorType.FatalError;
      }
    } else {
      this.reset();
    }
    this.code = code;

    if (ErrorHandler.authErrorCodes.includes(code)) {
      return ErrorType.Auth;
    }
    if (ErrorHandler.shouldRestartCodes.includes(code)) {
      return ErrorType.Restart;
    }
    if (code < 400 || code >= 500 || ErrorHandler.shouldRetryCodes.includes(code)) {
      return ErrorType.Retryable;
    }
    return ErrorType.FatalError;
  }

  wait(): Promise<number> {
    return new Promise(resolve => {
      this.delay = Math.min(this.delay * this.factor, this.max);
      setTimeout(() => resolve(this.attempts), this.delay + Math.floor(Math.random() * this.min));
    });
  }

  reset(): void {
    this.delay = this.min;
    this.attempts = 1;
    this.code = -1;
  }
}
