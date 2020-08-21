import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Uploader, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-a',
  templateUrl: './a.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UploadxService]
})
export class AComponent {
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`
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
