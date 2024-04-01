/**
 * Allows canceling some operation by calling cancel().
 * onCancel callback can be used to execute cleanup logic when cancel is called.
 */
export class Canceler {
  /**
   * Callback function to execute cleanup logic when cancel() is called
   */
  onCancel = (): void => {};

  /**
   * Cancels the operation.
   */
  cancel(): void {
    this.onCancel();
    this.onCancel = () => {};
  }
}
