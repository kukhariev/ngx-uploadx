import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Uploader, UploadState, UploadxOptions, UploadxService } from '../../uploadx';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-on-push',
  templateUrl: './on-push.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushComponent implements OnDestroy {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/upload`,
    token: this.tokenGetter.bind(this)
  };
  constructor(private uploadService: UploadxService, private auth: AuthService) {
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

  uploadAll(id: string) {
    this.uploadService.control({ action: 'upload' });
  }

  async tokenGetter(httpStatus: number) {
    const token =
      httpStatus === 401
        ? await this.auth.refreshToken().toPromise()
        : localStorage.getItem('token');
    return token;
  }
}
