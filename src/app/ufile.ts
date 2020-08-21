import { UploadState } from 'ngx-uploadx';

export class Ufile {
  name!: string;
  uploadId!: string;
  progress!: number;
  status!: string;

  constructor(state: UploadState) {
    this.uploadId = state.uploadId;
    this.update(state);
  }

  update(state: UploadState): void {
    this.name = state.name;
    this.progress = state.progress;
    this.status = state.status;
  }
}
