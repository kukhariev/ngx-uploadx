import { UploaderX } from 'ngx-uploadx';

export class UploaderExt extends UploaderX {
  // Disable delete files on cancel
  onCancel() {}

  // override auth scheme
  setAuth(encoded: string) {
    this.headers.Authorization = `Basic ${encoded}`;
  }
}
