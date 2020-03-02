import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';
import { UploaderExt } from './uploader-ext.class';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-code-way.component.html'
})
export class ServiceCodeWayComponent implements OnDestroy, OnInit {
  state$: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: btoa('user:pass'),
    chunkSize: 1024 * 256 * 8,
    uploaderClass: UploaderExt
  };
  numberOfCopies = 0;
  @ViewChild('file', { read: ElementRef }) fileInput: ElementRef;

  private unsubscribe$ = new Subject();
  constructor(private uploadService: UploadxService) {}

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

  onChange() {
    const files = this.getFiles();
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.uploadService.handleFile(files[i]);
    }
  }
  // this.numberOfCopies = this.uploadService.runningProcess();
  getFiles(): FileList {
    return this.fileInput.nativeElement.files;
  }

  onUpload(events$: Observable<UploadState>) {
    this.state$ = events$;
    events$.pipe(takeUntil(this.unsubscribe$)).subscribe((ufile: UploadState) => {
      const target = this.uploads.find(f => f.uploadId === ufile.uploadId);
      target ? Object.assign(target, ufile) : this.uploads.push(new Ufile(ufile));
    });
  }
}
