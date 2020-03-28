import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Uploader, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  styleUrls: ['./b.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UploadxService]
})
export class BComponent implements OnDestroy {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`
  };
  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect(this.options);
    this.state$ = this.uploadService.events;
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
