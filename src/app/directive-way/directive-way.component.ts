import { Component, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Ufile } from '../ufile';
import { UploadxOptions, UploadxControlEvent, UploadState } from '../../uploadx';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-directive-way',
  templateUrl: './directive-way.component.html'
})
export class DirectiveWayComponent implements OnDestroy {
  control: UploadxControlEvent;
  state: Observable<UploadState>;
  uploads: Ufile[];
  options: UploadxOptions;
  private ngUnsubscribe: Subject<any> = new Subject();
  constructor() {
    this.uploads = [];
    this.options = {
      concurrency: 2,
      allowedTypes: 'image/*,video/*',
      url: `${environment.api}/upload?uploadType=uploadx`,
      token: () => {
        return 'sometoken';
      },
      metadata: (f: File) => ({ title: f.name }),
      autoUpload: true,
      withCredentials: false,
      chunkSize: 1024 * 256 * 8,
      headers: (f: File) => ({
        'Content-Disposition': `filename=${encodeURI(f.name)}`
      })
    };
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  cancelAll() {
    this.control = { action: 'cancelAll' };
  }
  uploadAll() {
    this.control = { action: 'uploadAll' };
  }
  pauseAll() {
    this.control = { action: 'pauseAll' };
  }
  pause(uploadId: string) {
    this.control = { action: 'pause', uploadId };
  }
  upload(uploadId: string) {
    this.control = { action: 'upload', uploadId };
  }
  onUpload(uploadsOutStream: Observable<UploadState>) {
    this.state = uploadsOutStream;
    uploadsOutStream.pipe(takeUntil(this.ngUnsubscribe)).subscribe((ufile: UploadState) => {
      const index = this.uploads.findIndex(f => f.uploadId === ufile.uploadId);
      if (ufile.status === 'added') {
        this.uploads.push(new Ufile(ufile));
      } else {
        this.uploads[index].progress = ufile.progress;
        this.uploads[index].status = ufile.status;
      }
    });
  }
}
