import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Uploader, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { MultiPartFormData } from '../../../uploader-examples/multipart-form-data';
import { TusExt } from '../../../uploader-examples/tus-ext';
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
    endpoint: `${environment.api}/files?uploadType=multipart`,
    allowedTypes: 'image/*',
    uploaderClass: MultiPartFormData
  };
  options2: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=tus`,
    allowedTypes: 'video/*',
    uploaderClass: TusExt
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
