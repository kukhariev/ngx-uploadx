import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UploadxOptions, UploadState, UploadxService, UploadItem } from '../../uploadx';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';
import { AuthService, tokenGetter } from '../auth.service';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html'
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    concurrency: 2,
    allowedTypes: 'image/*,video/*',
    url: `${environment.api}/upload?uploadType=uploadx`,
    token: tokenGetter,
    autoUpload: true,
    chunkSize: 1024 * 256 * 8
  };
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private uploadService: UploadxService, private auth: AuthService) {}

  ngOnInit() {
    const uploadsProgress = this.uploadService.init(this.options);
    this.onUpload(uploadsProgress);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  cancelAll() {
    this.uploadService.control({ action: 'cancelAll' });
  }

  uploadAll() {
    this.uploadService.control({ action: 'uploadAll' });
  }

  pauseAll() {
    this.uploadService.control({ action: 'pauseAll' });
  }

  pause(uploadId: string) {
    this.uploadService.control({ action: 'pause', uploadId });
  }

  upload(uploadId: string) {
    this.uploadService.control({ action: 'upload', uploadId });
  }

  onUpload(uploadsOutStream: Observable<UploadState>) {
    this.state = uploadsOutStream;
    uploadsOutStream.pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: UploadState) => {
      const index = this.uploads.findIndex(f => f.uploadId === item.uploadId);
      if (item.status === 'added') {
        this.uploads.push(new Ufile(item));
      } else if (item.status === 'error') {
        //  Error Handler
        this.uploadService.control({ action: 'refreshToken', token: 'newToken' });
        this.uploadService.control({ action: 'upload', uploadId: item.uploadId });
      } else {
        this.uploads[index].progress = item.progress;
        this.uploads[index].status = item.status;
      }
    });
  }
}
