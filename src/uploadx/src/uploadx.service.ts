import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  UploadState,
  UploadStatus,
  UploadxControlEvent,
  UploadxOptions,
  UploadEvent
} from './interfaces';
import { UploaderX } from './uploaderx';
import { Uploader } from './uploader';
import { map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UploadxService {
  private UploaderClass = UploaderX;
  private readonly eventsStream: Subject<UploadState> = new Subject();
  get events() {
    return this.eventsStream.asObservable();
  }
  queue: Uploader[] = [];
  private concurrency = 2;
  private autoUpload = true;
  private options: UploadxOptions;
  stateChange = (evt: UploadState) => {
    setTimeout(() => {
      this.eventsStream.next(evt);
    });
  };

  get uploaderOptions(): UploadxOptions {
    return {
      method: this.options.method || 'POST',
      // tslint:disable-next-line: deprecation
      endpoint: this.options.endpoint || this.options.url,
      headers: this.options.headers,
      metadata: this.options.metadata,
      token: this.options.token,
      chunkSize: this.options.chunkSize,
      withCredentials: this.options.withCredentials,
      maxRetryAttempts: this.options.maxRetryAttempts,
      stateChange: this.stateChange
    };
  }

  constructor() {
    this.events.subscribe((evt: UploadEvent) => {
      if (evt.status !== 'uploading' && evt.status !== 'added') {
        this.processQueue();
      }
    });
  }
  /**
   * Initializes service
   * @param options global options
   * @returns Observable that emits a new value on progress or status changes
   */
  init(options: UploadxOptions): Observable<UploadState> {
    this.options = options;
    this.concurrency = options.concurrency || this.concurrency;
    this.autoUpload = !(options.autoUpload === false);
    return this.events;
  }
  /**
   * Initializes service
   * @param options global options
   * @returns Observable that emits the current queue
   */
  connect(options?: UploadxOptions): Observable<Uploader[]> {
    return this.init(options || this.options).pipe(
      startWith(0),
      map(() => this.queue)
    );
  }

  /**
   * Terminate all uploads and clears the queue
   */
  disconnect() {
    this.queue.forEach(f => (f.status = 'paused'));
    this.queue = [];
  }
  /**
   * Create Uploader and add to the queue
   */
  handleFileList(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const uploader = new this.UploaderClass(fileList.item(i), this.uploaderOptions);
      this.queue.push(uploader);
      uploader.status = 'added';
    }
    this.autoUploadFiles();
  }
  /**
   * Create Uploader for the file and add to the queue
   */
  handleFile(file: File): void {
    const uploader = new UploaderX(file, this.uploaderOptions);
    this.queue.push(uploader);
    uploader.status = 'added';
    this.autoUploadFiles();
  }
  /**
   * Auto upload the files if the flag is true
   * @internal
   */
  private autoUploadFiles(): void {
    if (this.autoUpload) {
      this.queue.filter(f => f.status === 'added').forEach(f => (f.status = 'queue'));
    }
  }
  /**
   * Control uploads status
   * @example
   * this.uploadService.control({ action: 'pauseAll' });
   *
   */
  control(event: UploadxControlEvent): void {
    switch (event.action) {
      case 'cancelAll':
        this.queue.forEach(f => (f.status = 'cancelled'));
        break;
      case 'pauseAll':
        this.queue.forEach(f => (f.status = 'paused'));
        break;
      case 'refreshToken':
        this.queue.forEach(f => f.refreshToken(event.token));
        break;
      case 'uploadAll':
        this.queue.filter(f => f.status !== 'uploading').forEach(f => (f.status = 'queue'));
        break;
      case 'upload':
        const uploadId = event.uploadId || event.itemOptions.uploadId;
        const upload = this.queue.find(f => f.uploadId === uploadId);
        upload.configure(event.itemOptions);
        upload.status = 'queue' as UploadStatus;
        break;
      case 'cancel':
        this.queue.find(f => f.uploadId === event.uploadId).status = 'cancelled';
        break;
      case 'pause':
        this.queue.find(f => f.uploadId === event.uploadId).status = 'paused';
        break;
      default:
        break;
    }
  }

  /**
   * Queue management
   * @internal
   */
  private processQueue() {
    // Remove Cancelled Items from local queue
    this.queue = this.queue.filter(f => f.status !== 'cancelled');

    const running = this.runningProcess();

    this.queue
      .filter((uploader: Uploader) => uploader.status === 'queue')
      .slice(0, Math.max(this.concurrency - running, 0))
      .forEach((uploader: Uploader) => {
        uploader.upload();
      });
  }
  /**
   * @returns  number of active uploads
   */
  runningProcess(): number {
    return this.queue.filter(
      (uploader: Uploader) => uploader.status === 'uploading' || uploader.status === 'retry'
    ).length;
  }
}
