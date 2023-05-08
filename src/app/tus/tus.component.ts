import { Component } from '@angular/core';
import { Tus, UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { AuthService } from '../auth.service';
import { serverUrl } from '../config';

@Component({
  selector: 'app-tus',
  templateUrl: './tus.component.html'
})
export class TusComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: UploadState[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    multiple: false,
    endpoint: `${serverUrl}/files?uploadType=tus`,
    uploaderClass: Tus,
    authorize: async req => {
      const token = await this.authService.getTokenAsPromise();
      req.headers['Authorization'] = `Token ${token}`;
      return req;
    },
    metadata(file): Record<string, string> {
      return { original_name: file.name };
    },
    retryConfig: { timeout: 60_000 },
    responseType: 'json'
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
    const target = this.uploads.find(item => item.uploadId === state.uploadId);
    target ? Object.assign(target, state) : this.uploads.push(state);
  }
}
