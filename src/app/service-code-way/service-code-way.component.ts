import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UploadState, UploadxOptions, UploadxService } from '../../uploadx';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-code-way.component.html'
})
export class ServiceCodeWayComponent implements OnDestroy, OnInit {
  state$: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    endpoint: `${environment.api}/upload?uploadType=uploadx`,
    token: 'someToken',
    chunkSize: 1024 * 256 * 8
  };
  private unsubscribe$ = new Subject();
  numberOfCopies = 0;

  @ViewChild('file', { read: ElementRef, static: true }) fileInput: ElementRef;

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
      if (target) {
        target.progress = ufile.progress;
        target.status = ufile.status;
      } else {
        this.uploads.push(new Ufile(ufile));
      }
    });
  }
}
