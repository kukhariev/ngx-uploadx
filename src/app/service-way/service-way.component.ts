import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { IdService, Tus, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { hasher, injectDigestHeader } from '../digest';

@Injectable()
export class CustomId implements IdService {
  async generateId(uploader: Tus): Promise<string> {
    if (uploader.file.size < 256 || !hasher.isSupported) {
      return new Date().getTime().toString(36);
    }
    const blob = uploader.file.slice(0, 256);
    return await hasher.getDigest(blob);
  }
}

// eslint-disable-next-line max-classes-per-file
@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html',
  providers: [UploadxService, { provide: IdService, useClass: CustomId }]
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: Map<string, UploadState> = new Map();
  private unsubscribe$ = new Subject<void>();
  options!: UploadxOptions;

  constructor(private uploadxService: UploadxService, private authService: AuthService) {}

  ngOnInit(): void {
    const endpoint = `${environment.api}/files?uploadType=tus`;
    this.uploadxService.request({ method: 'OPTIONS', url: endpoint }).then(
      ({ headers }) => {
        console.table(headers);
        const checkSumSupported =
          hasher.isSupported && ('Tus-Checksum-Algorithm' in headers || true); // debug
        this.options = {
          endpoint,
          uploaderClass: Tus,
          token: this.authService.getAccessToken(),
          prerequest: checkSumSupported ? injectDigestHeader : () => {}
        };
        this.state$ = this.uploadxService.init(this.options);
        this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
          this.uploads.set(state.uploadId, state);
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
