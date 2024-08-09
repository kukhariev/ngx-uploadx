import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlobUploader } from './blob-uploader ';
const env = {
  sasUrl:
    'http://127.0.0.1:10000/devstoreaccount1/container1?sv=2018-03-28&spr=https%2Chttp&st=2024-07-25T10%3A05%3A20Z&se=2028-01-26T10%3A05%3A00Z&sr=c&sp=racwdl&sig=0SPSW3G1X5qrdGrIIfaCj%2ByLrRl6g5EfjdG7aaQK7rA%3D'
};

@Component({
  selector: 'app-service-way',
  templateUrl: './service-code-way.component.html'
})
export class ServiceCodeWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: UploadState[] = [];
  options: UploadxOptions = {
    maxChunkSize: 100 * 1024 * 1024,
    uploaderClass: BlobUploader,
    endpoint: env.sasUrl
  };

  numberOfCopies = 0;
  @ViewChild('file', { read: ElementRef })
  fileInput!: ElementRef;

  private unsubscribe$ = new Subject<void>();

  constructor(private uploadService: UploadxService) {
    // restore background uploads
    this.uploads = this.uploadService.state();
  }

  ngOnInit(): void {
    this.state$ = this.uploadService.init(this.options);
    this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      const target = this.uploads.find(item => item.uploadId === state.uploadId);
      target ? Object.assign(target, state) : this.uploads.push(state);
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

  // this.numberOfCopies = this.uploadService.activeUploadsCount;
  getFiles(): FileList {
    return this.fileInput.nativeElement.files;
  }
}
