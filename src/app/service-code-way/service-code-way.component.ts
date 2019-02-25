import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UploadxOptions, UploadState, UploadxService, UploadItem } from '../../uploadx';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';
import { Uploader } from '../../uploadx/src/uploader';
import { UploadStatus } from '../../uploadx/src/interfaces';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-code-way.component.html'
})
export class ServiceCodeWayComponent implements OnDestroy, OnInit {
  state: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    concurrency: 2,
    allowedTypes: 'image/*,video/*',
    url: `${environment.api}/upload?uploadType=uploadx`,
    token: 'someToken',
    autoUpload: false,
    chunkSize: 1024 * 256 * 8
  };
  private ngUnsubscribe: Subject<any> = new Subject();
  numberOfCopies = 0;

  @ViewChild('file', { read: ElementRef }) fileInput: ElementRef;

  constructor(private uploadService: UploadxService) {}

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

  async onChange() {
    const files = this.getFiles();
    for (let i = 0; i < files.length; i++) {
      await this.uploadService.handleFile(files[i]);
    }
  }

  getFiles(): FileList {
    return this.fileInput.nativeElement.files;
  }

  onUpload(uploadsOutStream: Observable<UploadState>) {
    this.state = uploadsOutStream;
    uploadsOutStream.pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: UploadState) => {
      this.numberOfCopies = this.uploadService.runningProcess();
      const index = this.uploads.findIndex(f => f.uploadId === item.uploadId);
      if (item.status === 'added') {
        const cfg: UploadItem = {
          headers: {
            'Content-Disposition': `filename=${encodeURI(item.file.name)}`
          },
          metadata: {
            size: item.file.size,
            lastModified: item.file.lastModified
          }
        };
        this.uploadService.control({
          action: 'upload',
          itemOptions: cfg,
          uploadId: item.uploadId
        });
        this.uploads.unshift(new Ufile(item));
      } else {
        this.uploads[index].progress = item.progress;
        this.uploads[index].status = item.status;
      }
    });
  }
}
