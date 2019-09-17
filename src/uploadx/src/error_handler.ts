export enum ErrorType {
  Restart,
  Auth,
  Retryable,
  Fatal
}
export class ErrorHandler {
  static maxRetryAttempts = 8;
  static restartCodes = [404, 410];
  static authErrors = [401];
  static retryErrors = [423, 429];
  private delay: number;
  private code? = -1;
  private factor = 2;
  private min = 500;
  private max = this.min * 120;
  attempts = 1;

  constructor() {
    this.delay = this.min;
  }

  kind(code: number) {
    if (code === this.code) {
      this.attempts++;
      if (this.attempts > ErrorHandler.maxRetryAttempts) {
        return ErrorType.Fatal;
      }
    } else {
      this.reset();
    }
    this.code = code;

    if (ErrorHandler.authErrors.includes(code)) {
      return ErrorType.Auth;
    }
    if (ErrorHandler.restartCodes.includes(code)) {
      return ErrorType.Restart;
    }
    if (code < 400 || code >= 500 || ErrorHandler.retryErrors.includes(code)) {
      return { isRetryable: true };
    }
    return ErrorType.Fatal;
  }

  wait(code?: number): Promise<number> {
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
