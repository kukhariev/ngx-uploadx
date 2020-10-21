import { Component, OnDestroy, OnInit } from '@angular/core';
import { Tus, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { injectDigestHeader } from '../digest';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html'
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: Ufile[] = [];
  private unsubscribe$ = new Subject();

  constructor(private uploadxService: UploadxService, private auth: AuthService) {}

  ngOnInit(): void {
    const endpoint = `${environment.api}/files?uploadType=tus`;
    this.uploadxService.request({ method: 'OPTIONS', url: endpoint }).then(
      ({ headers }) => {
        console.table(headers);
        const checkSumSupported = 'Tus-Checksum-Algorithm' in headers || true; // debug
        const options: UploadxOptions = {
          endpoint,
          uploaderClass: Tus,
          token: this.auth.accessToken,
          prerequest: checkSumSupported ? injectDigestHeader : () => {}
        };
        this.state$ = this.uploadxService.init(options);
        this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
          const file = this.uploads.find(item => item.uploadId === state.uploadId);
          file ? file.update(state) : this.uploads.push(new Ufile(state));
        });
      },
      e => {
        console.error(e);
        this.ngOnInit();
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel(uploadId?: string): void {
    this.uploadxService.control({ action: 'cancel', uploadId });
  }

  pause(uploadId?: string): void {
    this.uploadxService.control({ action: 'pause', uploadId });
  }

  upload(uploadId?: string): void {
    this.uploadxService.control({ action: 'upload', uploadId });
  }
}
