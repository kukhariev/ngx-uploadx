import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadxService, UploadState, UploadxOptions, Uploader } from '../../uploadx';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-multiple-directive',
  templateUrl: './multiple-directive.component.html',
  styleUrls: ['./multiple-directive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleDirectiveComponent {
  state: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/upload`,
    allowedTypes: 'image/*',
    token: 'token'
  };
  options2: UploadxOptions = {
    endpoint: `${environment.api}/upload?endpoint=second`,
    allowedTypes: 'video/*',
    token: 'token2'
  };
  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect();
    this.state = this.uploadService.events;
  }
  cancelAll() {
    this.uploadService.control({ action: 'cancelAll' });
  }

  uploadAll() {
    this.uploadService.control({ action: 'uploadAll' });
  }

  pauseAll() {
    this.uploadService.control({ action: 'pauseAll' });
  }

  pause(uploadId: string) {
    this.uploadService.control({ action: 'pause', uploadId });
  }

  upload(uploadId: string) {
    this.uploadService.control({ action: 'upload', uploadId });
  }
}
