/**
 *  Exponential Backoff Retries
 */
export class BackoffRetry {
  private delay: number;
  private code = -1;
  private k = 2;
  retryAttempts = 1;
  /**
   * @param min  Initial retry delay
   * @param max  Max retry delay
   */
  constructor(private min = 500, private max = min * 120) {
    this.delay = this.min;
  }
  /**
   * Delay Retry
   * @param code xhr status code
   * @returns retryAttempts
   */
  wait(code?: number): Promise<number> {
    return new Promise(resolve => {
      if (code === this.code) {
        this.retryAttempts++;
        this.delay = Math.min(this.delay * this.k, this.max);
      } else {
        this.reset();
      }
      this.code = code;
      setTimeout(
        () => resolve(this.retryAttempts),
        this.delay + Math.floor(Math.random() * this.min)
      );
    });
  }
  /**
   * Reset Retry
   */
  reset(): void {
    this.delay = this.min;
    this.retryAttempts = 1;
    this.code = -1;
  }
}
