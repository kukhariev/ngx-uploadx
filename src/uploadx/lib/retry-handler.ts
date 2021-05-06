export enum ErrorType {
  NotFound,
  Auth,
  Retryable,
  Fatal
}

export type ShouldRetryFunction = (code: number, attempts: number) => boolean;

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Upload not exist status codes */
  shouldRestartCodes?: number[];
  /** Bad token? status codes */
  authErrorCodes?: number[];
  /** Retryable 4xx status codes */
  shouldRetryCodes?: number[];
  /** Overrides the built-in function that determines whether the operation should be repeated */
  shouldRetry?: ShouldRetryFunction;
  minDelay?: number;
  maxDelay?: number;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 8,
  shouldRestartCodes: [404, 410],
  authErrorCodes: [401],
  shouldRetryCodes: [423, 429],
  shouldRetry(code: number): boolean {
    return code < 400 || code >= 500 || this.shouldRetryCodes.indexOf(code) !== -1;
  },
  minDelay: 500,
  maxDelay: 50000
};

/**
 * Retryable ErrorHandler
 */
export class RetryHandler {
  public attempts = 0;
  config: Required<RetryConfig>;
  cancel: () => void = () => {};

  constructor(configOptions: RetryConfig = {}) {
    this.config = Object.assign({}, defaultRetryConfig, configOptions);
  }

  kind(code: number): ErrorType {
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
    if (this.config.shouldRetry(code, this.attempts)) {
      return ErrorType.Retryable;
    }
    return ErrorType.Fatal;
  }

  wait(): Promise<void> {
    const ms =
      Math.min(2 ** (this.attempts - 1) * this.config.minDelay, this.config.maxDelay) +
      Math.floor(Math.random() * this.config.minDelay);
    let id: ReturnType<typeof setTimeout>;
    return new Promise(resolve => {
      this.cancel = () => {
        clearTimeout(id);
        resolve();
      };
      id = setTimeout(this.cancel, ms);
    });
  }

  reset(): void {
    this.attempts = 0;
  }
}
