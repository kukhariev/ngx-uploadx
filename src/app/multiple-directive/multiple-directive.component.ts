import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Uploader, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-multiple-directive',
  templateUrl: './multiple-directive.component.html',
  styleUrls: ['./multiple-directive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleDirectiveComponent {
  state$: Observable<UploadState>;
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
    this.state$ = this.uploadService.events;
  }
  cancel(id?: string) {
    this.uploadService.control({ action: 'cancel', uploadId: id });
  }

  pause(id?: string) {
    this.uploadService.control({ action: 'pause', uploadId: id });
  }

  upload(id?: string) {
    this.uploadService.control({ action: 'upload', uploadId: id });
  }
}
