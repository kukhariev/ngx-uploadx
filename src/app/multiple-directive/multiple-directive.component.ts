import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Tus, Uploader, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-multiple-directive',
  templateUrl: './multiple-directive.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleDirectiveComponent {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  imageUploadOptions: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    allowedTypes: 'image/*'
  };

  videoUploadOptions: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=tus`,
    allowedTypes: 'video/*',
    uploaderClass: Tus
  };

  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect();
    this.state$ = this.uploadService.events;
  }

  cancel(uploadId?: string): void {
    this.uploadService.control({ action: 'cancel', uploadId });
  }

  pause(uploadId?: string): void {
    this.uploadService.control({ action: 'pause', uploadId });
  }

  upload(uploadId?: string): void {
    this.uploadService.control({ action: 'upload', uploadId });
  }
}
