import { Component } from '@angular/core';
import { UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-directive-way',
  templateUrl: './directive-way.component.html'
})
export class DirectiveWayComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: localStorage.getItem('token') || 'token',
    retryConfig: {
      maxAttempts: 30,
      maxDelay: 60_000,
      shouldRetry: (code, attempts) => {
        return code === 504 || ((code < 400 || code >= 501) && attempts < 5);
      }
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

  onStateChanged(evt: UploadState): void {
    this.state = evt;
    const file = this.uploads.find(item => item.uploadId === evt.uploadId);
    file ? file.update(evt) : this.uploads.push(new Ufile(evt));
  }
}
