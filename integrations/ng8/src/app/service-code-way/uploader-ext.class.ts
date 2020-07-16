import { UploaderX } from 'ngx-uploadx';

export class UploaderExt extends UploaderX {
  // override auth scheme
  setAuth(encoded: string): void {
    this.headers.Authorization = `Basic ${encoded}`;
  }
}
