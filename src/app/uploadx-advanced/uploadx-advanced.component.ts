import { Component, inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  IdService,
  Uploader,
  UploadState,
  UploadxDirective,
  UploadxDropDirective,
  UploadxOptions,
  UploadxService
} from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { serverUrl } from '../config';
import { hasher, injectDigestHeader } from '../digest';
import { CommonModule } from '@angular/common';

@Injectable()
export class CustomId implements IdService {
  async generateId(uploader: Uploader): Promise<string> {
    const blob = uploader.file.size > 256 ? uploader.file.slice(0, 256) : uploader.file;
    const hash = hasher.isSupported ? await hasher.digestHex(blob) : '';
    return `${uploader.file.name}-${uploader.file.size}-${hash}`;
  }
}

@Component({
  selector: 'app-uploadx-advanced',
  templateUrl: './uploadx-advanced.component.html',
  standalone: true,
  imports: [CommonModule, UploadxDirective, UploadxDropDirective],
  providers: [UploadxService, { provide: IdService, useClass: CustomId }]
})
export class UploadxAdvancedComponent implements OnDestroy, OnInit {
  uploadxService = inject(UploadxService);

  state$!: Observable<UploadState>;
  uploads: UploadState[] = [];
  private unsubscribe$ = new Subject<void>();
  private authService = inject(AuthService);
  options: UploadxOptions = {
    endpoint: `${serverUrl}/files?uploadType=uploadx`,
    token: this.authService.getAccessToken,
    // Custom ID via IdService provider (Content-based: name + size + SHA-1)
    // Dynamic headers per file
    headers: (file: File) => ({
      'X-File-Name': file.name,
      'X-File-Size': `${file.size}`,
      'X-Client-Source': this.constructor.name
    }),
    // prerequest: Digest mode — adds SHA-1 hash of request body
    prerequest: injectDigestHeader,
    // Metadata function — includes original name + demo tags
    metadata: (file: File) => ({
      originalName: file.name,
      demoTag: 'uploadx-advanced',
      timestamp: Date.now()
    }),
    // Multiple concurrent uploads (default: 2)
    concurrency: 3,
    chunkSize: 1024 * 1024 * 32,
    // Retry configuration
    retryConfig: {
      maxAttempts: 10,
      maxDelay: 30_000
    }
  };

  ngOnInit(): void {
    this.state$ = this.uploadxService.init(this.options);
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
    this.uploadxService.control({ action: 'cancel', uploadId });
  }

  pause(uploadId?: string): void {
    this.uploadxService.control({ action: 'pause', uploadId });
  }

  upload(uploadId?: string): void {
    this.uploadxService.control({ action: 'upload', uploadId });
  }

  update(uploadId?: string): void {
    this.uploadxService.control({
      action: 'update',
      uploadId,
      metadata: { demoTag: 'updated-at-' + Date.now() }
    });
  }

  get activeUploads(): number {
    return this.uploads.filter(u => u.status === 'uploading' || u.status === 'retry').length;
  }
}
