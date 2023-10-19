export enum ErrorType {
  NotFound,
  Auth,
  Retryable,
  Fatal
}

export type ShouldRetryFunction = (code: number, attempts: number) => boolean;
export type KeepPartialFunction = (code: number) => boolean;

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
  /** The minimum retry delay */
  minDelay?: number;
  /** The maximum retry delay */
  maxDelay?: number;
  /** Delay used between retries for non-error responses with missing range/offset */
  onBusyDelay?: number;
  /** Time interval after which hanged requests must be retried */
  timeout?: number;
  /** Determines whether partial chunks should be kept */
  keepPartial?: boolean | KeepPartialFunction;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 8,
  shouldRestartCodes: [404, 410],
  authErrorCodes: [401],
  shouldRetryCodes: [408, 423, 429, 460],
  shouldRetry(code: number): boolean {
    return code < 400 || code >= 500 || this.shouldRetryCodes.includes(code);
  },
  minDelay: 500,
  maxDelay: 50000,
  onBusyDelay: 1000,
  timeout: 0,
  keepPartial(statusCode): boolean {
    return statusCode >= 400;
  }
};

/**
 * Retryable ErrorHandler
 */
export class RetryHandler {
  public attempts = 0;
  config: Required<RetryConfig>;
  private observedValue?: string | number;
  cancel: () => void = () => {};

  constructor(configOptions: RetryConfig = {}) {
    this.config = Object.assign({}, defaultRetryConfig, configOptions);
  }

  /**
   * Determine error type based on response code
   * @param code - HTTP response status code
   */
  kind(code: number): ErrorType {
    this.attempts++;
    if (this.attempts > this.config.maxAttempts) {
      return ErrorType.Fatal;
    }
    if (this.config.authErrorCodes.includes(code)) {
      return ErrorType.Auth;
    }
    if (this.config.shouldRestartCodes.includes(code)) {
      return ErrorType.NotFound;
    }
    if (this.config.shouldRetry(code, this.attempts)) {
      return ErrorType.Retryable;
    }
    return ErrorType.Fatal;
  }

  /**
   * Wait before next retry attempt
   * @param time - Delay in ms
   */
  wait(time?: number): Promise<void> {
    const ms =
      time || Math.min(2 ** (this.attempts - 1) * this.config.minDelay, this.config.maxDelay);
    const jitter = Math.floor(Math.random() * this.config.minDelay * this.attempts);
    let id: ReturnType<typeof setTimeout>;
    return new Promise(resolve => {
      this.cancel = () => {
        clearTimeout(id);
        resolve();
      };
      id = setTimeout(this.cancel, ms + jitter);
    });
  }

  /**
   * Observes value to reset retry attempts counter
   * @param value - Value to observe
   */
  observe(value?: string | number): void {
    this.observedValue !== value && (this.attempts = 0);
    this.observedValue = value;
  }
}
