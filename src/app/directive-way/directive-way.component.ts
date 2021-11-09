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
  uploads: Map<string, UploadState> = new Map();
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: this.authService.getAccessToken(),
    maxChunkSize: 1024 * 1024 * 8,
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
    this.state = state;
    this.uploads.set(state.uploadId, state);
  }
}
