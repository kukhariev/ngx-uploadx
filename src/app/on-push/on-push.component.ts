import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import {
  Uploader,
  UploadState,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions,
  UploadxService
} from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { serverUrl } from '../config';
import { injectDigestHeader } from '../digest';
import { AsyncPipe, JsonPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-on-push',
  templateUrl: './on-push.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, JsonPipe, AsyncPipe, UploadxDropDirective, UploadxDirective],
  standalone: true
})
export class OnPushComponent implements OnDestroy {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${serverUrl}/files?uploadType=uploadx`,
    chunkSize: 1024 * 1024 * 64,
    prerequest: injectDigestHeader,
    authorize: (req, token) => {
      token && (req.headers['Authorization'] = `Token ${token}`);
      return req;
    }
  };

  constructor(
    private uploadService: UploadxService,
    private authService: AuthService
  ) {
    this.uploads$ = this.uploadService.connect(this.options);
    this.state$ = this.uploadService.events;
    this.authService.getToken().subscribe(token => {
      this.uploadService.control({ token });
    });
  }

  ngOnDestroy(): void {
    this.uploadService.disconnect();
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

  updateAll(): void {
    this.uploadService.control({ action: 'update', metadata: { updated: Date.now() } });
  }
}
