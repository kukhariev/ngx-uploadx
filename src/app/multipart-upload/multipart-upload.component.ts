import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  UploadState,
  UploadxControlEvent,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions
} from 'ngx-uploadx';
import { serverUrl } from '../config';
import { MultiPartFormData } from './multipart-form-data.class';

@Component({
  selector: 'app-multipart-upload',
  templateUrl: './multipart-upload.component.html',
  standalone: true,
  imports: [UploadxDirective, UploadxDropDirective, JsonPipe]
})
export class MultipartUploadComponent {
  control!: UploadxControlEvent;
  state!: UploadState;
  uploads: UploadState[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${serverUrl}/files?uploadType=multipart`,
    uploaderClass: MultiPartFormData
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
