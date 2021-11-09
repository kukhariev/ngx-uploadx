import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UploaderExt } from './uploader-ext.class';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-code-way.component.html'
})
export class ServiceCodeWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: Map<string, UploadState> = new Map();
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=multipart`,
    token: btoa('user:pass'),
    uploaderClass: UploaderExt
  };
  numberOfCopies = 0;
  @ViewChild('file', { read: ElementRef })
  fileInput!: ElementRef;

  private unsubscribe$ = new Subject<void>();

  constructor(private uploadService: UploadxService) {
    // restore background uploads
    this.uploadService.queue.forEach(uploader => {
      this.uploads.set(uploader.uploadId, uploader);
    });
  }

  ngOnInit(): void {
    this.state$ = this.uploadService.init(this.options);
    this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      this.uploads.set(state.uploadId, state);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel(uploadId?: string): void {
    this.uploadService.control({ action: 'cancel', uploadId });
  }

  pause(uploadId?: string): void {
    this.uploadService.control({ action: 'pause', uploadId });
  }

  upload(uploadId?: string): void {
    this.uploadService.control({ action: 'upload', uploadId });
  }

  onChange(): void {
    const files = this.getFiles();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.uploadService.handleFiles(files[i]);
    }
  }

  // this.numberOfCopies = this.uploadService.runningProcess();
  getFiles(): FileList {
    return this.fileInput.nativeElement.files;
  }
}
