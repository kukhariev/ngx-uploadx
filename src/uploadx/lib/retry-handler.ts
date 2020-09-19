import { Injectable } from '@angular/core';

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
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 8,
  shouldRestartCodes: [404, 410],
  authErrorCodes: [401],
  shouldRetryCodes: [423, 429],
  minDelay: 500,
  maxDelay: 50000
};

/**
 * Retryable ErrorHandler
 */
@Injectable({ providedIn: 'root' })
export class RetryHandler {
  config: Required<RetryConfig> = defaultRetryConfig;

  init(configOptions: RetryConfig = {}): void {
    this.config = Object.assign(this.config, configOptions);
  }

  kind(code: number): ErrorType {
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

  wait(attempts: number, cancel: () => void): Promise<void> {
    const ms =
      Math.min(2 ** (attempts - 1) * this.config.minDelay, this.config.maxDelay) +
      Math.floor(Math.random() * this.config.minDelay);
    let id: number;
    return new Promise(resolve => {
      cancel = () => {
        window.clearTimeout(id);
        resolve();
      };
      id = window.setTimeout(cancel, ms);
    });
  }
}
