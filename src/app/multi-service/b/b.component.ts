import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Uploader, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { serverUrl } from '../../config';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UploadxService]
})
export class BComponent {
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${serverUrl}/files?uploadType=uploadx`
  };

  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect(this.options);
  }

  cancelAll(): void {
    this.uploadService.control({ action: 'cancel' });
  }

  pauseAll(): void {
    this.uploadService.control({ action: 'pause' });
  }

  uploadAll(): void {
    this.uploadService.control({ action: 'upload' });
  }
}
