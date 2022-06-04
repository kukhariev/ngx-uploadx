import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { IdService, Tus, UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { hasher, injectTusChecksumHeader } from '../digest';

@Injectable()
export class CustomId implements IdService {
  async generateId(uploader: Tus): Promise<string> {
    if (uploader.file.size < 256 || !hasher.isSupported) {
      return new Date().getTime().toString(36);
    }
    const blob = uploader.file.slice(0, 256);
    return hasher.digestHex(blob);
  }
}

@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html',
  providers: [UploadxService, { provide: IdService, useClass: CustomId }]
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: UploadState[] = [];
  private unsubscribe$ = new Subject<void>();
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=tus`,
    uploaderClass: Tus,
    token: this.authService.getAccessToken
    // prerequest: injectTusChecksumHeader
  };

  constructor(private uploadxService: UploadxService, private authService: AuthService) {}

  ngOnInit(): void {
    this.state$ = this.uploadxService.init(this.options);
    this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      const target = this.uploads.find(item => item.uploadId === state.uploadId);
      target ? Object.assign(target, state) : this.uploads.push(state);
    });

    this.uploadxService.ajax
      .request({ method: 'OPTIONS', url: this.options.endpoint as string })
      .then(({ headers }) => {
        if (hasher.isSupported && headers['tus-checksum-algorithm'].includes('sha1')) {
          this.uploadxService.options.prerequest = injectTusChecksumHeader;
        }
      }, console.error);
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
