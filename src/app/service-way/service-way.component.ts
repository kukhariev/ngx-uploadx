import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UploadState, UploadxOptions, UploadxService } from '../../uploadx';
import { AuthService } from '../auth.service';
import { Ufile } from '../ufile';
import { UploaderExt } from './uploader-ext.class';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html'
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state$: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    endpoint: `${environment.api}/upload`,
    token: () => this.auth.accessToken,
    chunkSize: 2_097_152,
    uploaderClass: UploaderExt
  };
  private unsubscribe$ = new Subject();

  constructor(private uploadService: UploadxService, private auth: AuthService) {}

  ngOnInit() {
    const uploadsProgress = this.uploadService.init(this.options);
    this.onUpload(uploadsProgress);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel(id?: string) {
    this.uploadService.control({ action: 'cancel', uploadId: id });
  }

  pause(id?: string) {
    this.uploadService.control({ action: 'pause', uploadId: id });
  }

  upload(id?: string) {
    this.uploadService.control({ action: 'upload', uploadId: id });
  }

  onUpload(uploadsOutStream: Observable<UploadState>) {
    this.state$ = uploadsOutStream;
    uploadsOutStream.pipe(takeUntil(this.unsubscribe$)).subscribe((evt: UploadState) => {
      if (evt.status === 'retry' && evt.responseStatus === 401) {
        this.auth.renewToken().subscribe(token => console.log('new accessToken: ', token));
      }
      const target = this.uploads.find(f => f.uploadId === evt.uploadId);
      if (target) {
        target.progress = evt.progress;
        target.status = evt.status;
      } else {
        this.uploads.push(new Ufile(evt));
      }
    });
  }
}
