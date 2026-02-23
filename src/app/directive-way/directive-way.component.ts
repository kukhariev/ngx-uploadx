import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  UploadState,
  UploadxControlEvent,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions
} from 'ngx-uploadx';
import { AuthService } from '../auth.service';
import { serverUrl as serverUrl } from '../config';

@Component({
  selector: 'app-directive-way',
  templateUrl: './directive-way.component.html',
  standalone: true,
  imports: [UploadxDirective, UploadxDropDirective, JsonPipe]
})
export class DirectiveWayComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: UploadState[] = [];
  private authService = inject(AuthService);
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${serverUrl}/files?uploadType=uploadx`,
    token: this.authService.accessToken,
    // token: this.authService.getAccessToken,
    // token: this.authService.getTokenAsPromise,
    metadata: (file: File) => ({ originalName: file.name }),
    chunkSize: 1024 * 1024 * 96, //--> Cloudflare Free/Pro maximum body size is 100MB
    storeIncompleteHours: 24,
    retryConfig: {
      maxAttempts: 30,
      maxDelay: 60_000,
      shouldRetry: (code, attempts) => {
        return code === 503 || ((code < 400 || code >= 501) && attempts < 5);
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

  update(uploadId?: string): void {
    this.control = { action: 'update', uploadId, metadata: { updated: Date.now() } };
  }

  onStateChanged(state: UploadState): void {
    this.state = state;
    const target = this.uploads.find(item => item.uploadId === state.uploadId);
    if (target) {
      Object.assign(target, state);
    } else {
      this.uploads.push(state);
    }
  }
}
