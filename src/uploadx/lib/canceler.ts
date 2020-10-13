export class Canceler {
  onCancel = () => {};

  cancel(): void {
    this.onCancel();
    this.onCancel = () => {};
  }
}
