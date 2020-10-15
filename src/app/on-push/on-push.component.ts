import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Uploader, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { injectDigestHeader } from '../digest';

@Component({
  selector: 'app-on-push',
  templateUrl: './on-push.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushComponent implements OnDestroy {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    prerequest: injectDigestHeader,
    token: async (httpStatus?: number): Promise<string> =>
      httpStatus === 401 ? await this.auth.renewToken().toPromise() : this.auth.accessToken
  };

  constructor(private uploadService: UploadxService, private auth: AuthService) {
    this.uploads$ = this.uploadService.connect(this.options);
    this.state$ = this.uploadService.events;
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
}
