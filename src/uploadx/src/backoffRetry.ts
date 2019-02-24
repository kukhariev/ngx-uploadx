/**
 *  Exponential Backoff Retries
 */
export class BackoffRetry {
  private delay: number;
  /**
   *
   * Creates an instance of BackoffRetry.
   * @default
   * minInterval = 1000 ms
   * maxInterval = minInterval * 120 (2 min)
   * k = 2
   */
  constructor(private minInterval = 1000, private maxInterval = minInterval * 120, private k = 2) {
    this.delay = this.minInterval;
  }
  // TODO implement the "Retry-After"
  /**
   * Delay Retry
   */
  wait(): Promise<{}> {
    return new Promise(resolve => {
      setTimeout(resolve, this.delay + Math.floor(Math.random() * this.minInterval));
      this.delay = Math.min(this.delay * this.k, this.maxInterval);
    });
  }
  /**
   * Reset Retry Interval
   */
  reset(): void {
    this.delay = this.minInterval;
  }
}
