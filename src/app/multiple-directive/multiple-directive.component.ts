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
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    allowedTypes: 'image/*'
  };
  options2: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=tus`,
    allowedTypes: 'video/*',
    uploaderClass: Tus
  };

  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect();
    this.state$ = this.uploadService.events;
  }

  cancel(id?: string): void {
    this.uploadService.control({ action: 'cancel', uploadId: id });
  }

  pause(id?: string): void {
    this.uploadService.control({ action: 'pause', uploadId: id });
  }

  upload(id?: string): void {
    this.uploadService.control({ action: 'upload', uploadId: id });
  }
}
