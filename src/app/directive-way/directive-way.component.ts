import { Component } from '@angular/core';
import { UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-directive-way',
  templateUrl: './directive-way.component.html'
})
export class DirectiveWayComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: UploadState[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: this.authService.accessToken,
    // token: this.authService.getAccessToken,
    // token: this.authService.getTokenAsPromise,
    maxChunkSize: 1024 * 1024 * 80,
    storeIncompleteHours: 24,
    retryConfig: {
      maxAttempts: 30,
      maxDelay: 60_000,
      shouldRetry: (code, attempts) => {
        return code === 503 || ((code < 400 || code >= 501) && attempts < 5);
      }
    }
  };

  constructor(private authService: AuthService) {}
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
    const err = state.response?.error?.message || state.response?.error || 'Unknown error';
    console.log(`${state.uploadId}: ${state.status} (${err})`);
    this.state = state;
    const target = this.uploads.find(item => item.uploadId === state.uploadId);
    target ? Object.assign(target, state) : this.uploads.push(state);
  }
}
