import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Uploader, UploadState, UploadxOptions, UploadxService } from '../../uploadx';
import { AuthService } from '../auth.service';

// Redefining example:
const { deviceMemory } = navigator as any;

Uploader.fatalErrors = [400, 403, 405];

Uploader.maxChunkSize = (deviceMemory || 0.25) * 256 * 1024 * 1024;
console.log(`Device memory at least: ${deviceMemory}GiB`);
console.log(`maxChunkSize: ${Uploader.maxChunkSize / 1024 / 1024}MiB`);

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
      httpStatus === 401 ? await this.auth.renewToken().toPromise() : this.auth.accessToken;
    return token;
  }
}
