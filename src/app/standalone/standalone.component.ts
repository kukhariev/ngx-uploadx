import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  UploadState,
  UploadxControlEvent,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions
} from 'ngx-uploadx';
import { AuthService } from '../auth.service';
import { serverUrl } from '../config';

@Component({
  selector: 'app-standalone',
  standalone: true,
  imports: [CommonModule, UploadxDirective, UploadxDropDirective],
  templateUrl: './standalone.component.html'
})
export class StandaloneComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: UploadState[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${serverUrl}/files?uploadType=uploadx`,
    token: this.authService.getTokenAsPromise
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

  update(uploadId?: string): void {
    this.control = { action: 'update', uploadId, metadata: { updated: Date.now() } };
  }

  onStateChanged(state: UploadState): void {
    this.state = state;
    const target = this.uploads.find(item => item.uploadId === state.uploadId);
    target ? Object.assign(target, state) : this.uploads.push(state);
  }
}
