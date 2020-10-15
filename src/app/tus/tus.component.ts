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
    uploaderClass: Tus,
    chunkSize: 0,
    metadata(file): Record<string, string> {
      return { original_name: file.name };
    }
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
    this.state = state;
    const file = this.uploads.find(item => item.uploadId === state.uploadId);
    file ? file.update(state) : this.uploads.push(new Ufile(state));
  }
}
