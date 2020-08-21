import { Component } from '@angular/core';
import { Tus, UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-tus',
  templateUrl: './tus.component.html'
})
export class TusComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: Ufile[] = [];

  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=tus`,
    // endpoint: `https://master.tus.io/files/`,
    uploaderClass: Tus,
    chunkSize: 0
  };

  cancel(uploadId?: string): void {
    this.control = { action: 'cancel', uploadId };
  }

  pause(uploadId?: string): void {
    this.control = { action: 'pause', uploadId };
  }

  upload(uploadId?: string): void {
    this.control = { action: 'upload', uploadId };
  }

  onStateChanged(state: UploadState): void {
    const file = this.uploads.find(item => item.uploadId === state.uploadId);
    file ? file.update(state) : this.uploads.push(new Ufile(state));
  }
}
