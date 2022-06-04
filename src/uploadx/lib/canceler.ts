export class Canceler {
  onCancel = (): void => {};

  cancel(): void {
    this.onCancel();
    this.onCancel = () => {};
  }
}
