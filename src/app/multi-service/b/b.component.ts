import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Uploader, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UploadxService]
})
export class BComponent implements OnDestroy {
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`
  };
  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect(this.options);
  }

  ngOnDestroy(): void {
    this.uploadService.disconnect();
  }

  cancelAll() {
    this.uploadService.control({ action: 'cancel' });
  }

  pauseAll() {
    this.uploadService.control({ action: 'pause' });
  }

  uploadAll() {
    this.uploadService.control({ action: 'upload' });
  }
}
