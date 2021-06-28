import { Component } from '@angular/core';
import { Tus, UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
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
    authorize: async req => {
      const token = await this.authService.getTokenAsPromise();
      req.headers.Authorization = `Token ${token}`;
      return req;
    },
    metadata(file): Record<string, string> {
      return { original_name: file.name };
    },
    retryConfig: { timeout: 10_000 }
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
    const file = this.uploads.find(item => item.uploadId === state.uploadId);
    file ? file.update(state) : this.uploads.push(new Ufile(state));
  }
}
