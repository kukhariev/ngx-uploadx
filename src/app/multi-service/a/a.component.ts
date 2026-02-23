import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Uploader,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions,
  UploadxService
} from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { serverUrl } from '../../config';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-a',
  templateUrl: './a.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [UploadxDirective, UploadxDropDirective, AsyncPipe],
  providers: [UploadxService]
})
export class AComponent {
  private uploadService = inject(UploadxService);

  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${serverUrl}/files?uploadType=uploadx`
  };

  constructor() {
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
