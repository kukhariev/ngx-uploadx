import { UploaderX } from 'ngx-uploadx';

export class UploaderExt extends UploaderX {
  // Disable delete files on cancel
  onCancel(): void {}

  // override auth scheme
  setAuth(encoded: string): void {
    this.headers.Authorization = `Basic ${encoded}`;
  }
}
