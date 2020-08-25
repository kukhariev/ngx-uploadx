export enum ErrorType {
  NotFound,
  Auth,
  Retryable,
  Fatal
}

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Upload not exist status codes */
  shouldRestartCodes?: number[];
  /** Bad token? status codes */
  authErrorCodes?: number[];
  /** Retryable 4xx status codes */
  shouldRetryCodes?: number[];
  minDelay?: number;
  maxDelay?: number;
  factor?: number;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 8,
  shouldRestartCodes: [404, 410],
  authErrorCodes: [401],
  shouldRetryCodes: [423, 429],
  minDelay: 500,
  maxDelay: 5000,
  factor: 2
};

/**
 * Retryable ErrorHandler
 */
export class ErrorHandler {
  public attempts = 0;
  config: Required<RetryConfig>;
  private delay: number;
  private code = -1;

  constructor(configOptions: RetryConfig = {}) {
    this.config = Object.assign({}, defaultRetryConfig, configOptions);
    this.delay = this.config.minDelay;
  }

  kind(code: number): ErrorType {
    code !== this.code && this.reset();
    this.code = code;
    this.attempts++;

    if (this.attempts > this.config.maxAttempts) {
      return ErrorType.Fatal;
    }
    if (this.config.authErrorCodes.indexOf(code) !== -1) {
      return ErrorType.Auth;
    }
    if (this.config.shouldRestartCodes.indexOf(code) !== -1) {
      return ErrorType.NotFound;
    }
    if (code < 400 || code >= 500 || this.config.shouldRetryCodes.indexOf(code) !== -1) {
      return ErrorType.Retryable;
    }
    return ErrorType.Fatal;
  }

  wait(): Promise<number> {
    return new Promise(resolve => {
      this.delay = Math.min(this.delay * this.config.factor, this.config.maxDelay);
      setTimeout(
        () => resolve(this.attempts),
        this.delay + Math.floor(Math.random() * this.config.minDelay)
      );
    });
  }

  reset(): void {
    this.delay = this.config.minDelay;
    this.attempts = 0;
    this.code = -1;
  }
}
