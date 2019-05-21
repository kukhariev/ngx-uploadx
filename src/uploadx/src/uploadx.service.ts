import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
  UploadEvent,
  UploadState,
  UploadStatus,
  UploadxControlEvent,
  UploadxOptions,
  UploaderOptions
} from './interfaces';
import { Uploader } from './uploader';
import { UploaderX } from './uploaderx';

@Injectable({ providedIn: 'root' })
export class UploadxService {
  private uploaderClass: new (f: File, options: UploadxOptions) => Uploader;
  private readonly eventsStream: Subject<UploadState> = new Subject();
  get events() {
    return this.eventsStream.asObservable();
  }
  queue: Uploader[] = [];
  options: UploadxOptions = {
    endpoint: '/upload',
    autoUpload: true,
    concurrency: 2,
    uploaderClass: UploaderX,
    stateChange: (evt: UploadState) => {
      setTimeout(() => this.ngZone.run(() => this.eventsStream.next(evt)));
    }
  };

  constructor(private ngZone: NgZone) {
    this.events.subscribe((evt: UploadEvent) => {
      if (evt.status !== 'uploading' && evt.status !== 'added') {
        this.ngZone.runOutsideAngular(() => this.processQueue());
      }
    });
  }

  /**
   * Initializes service
   * @param options global options
   * @returns Observable that emits a new value on progress or status changes
   */
  init(options: UploadxOptions): Observable<UploadState> {
    this.options = { ...this.options, ...options };
    this.uploaderClass = this.options.uploaderClass;
    return this.events;
  }
  /**
   * Initializes service
   * @param options global options
   * @returns Observable that emits the current array of uploaders
   */
  connect(options?: UploadxOptions): Observable<Uploader[]> {
    return this.init(options || this.options).pipe(
      startWith(0),
      map(() => this.queue)
    );
  }

  /**
   * Terminates all uploads and clears the queue
   */
  disconnect(): void {
    this.queue.forEach(f => (f.status = 'paused'));
    this.queue = [];
  }

  /**
   * Create Uploader and add to the queue
   */
  handleFileList(fileList: FileList): void {
    Array.from(fileList).forEach(file => this.addUploaderInstance(file));
    this.autoUploadFiles();
  }

  /**
   * Create Uploader for the file and add to the queue
   */
  handleFile(file: File): void {
    this.addUploaderInstance(file);
    this.autoUploadFiles();
  }

  private addUploaderInstance(file: File) {
    const uploader = new this.uploaderClass(file, this.options as UploaderOptions);
    this.queue.push(uploader);
    uploader.status = 'added';
  }

  /**
   * Auto upload the files if the flag is true
   * @internal
   */
  private autoUploadFiles(): void {
    if (this.options.autoUpload) {
      this.queue.filter(f => f.status === 'added').forEach(f => (f.status = 'queue'));
    }
  }
  /**
   * Control the uploads status
   * @example
   * this.uploadService.control({ action: 'pauseAll' });
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
  private processQueue(): void {
    // Remove Cancelled Items from local queue
    this.queue = this.queue.filter(f => f.status !== 'cancelled');

    const running = this.runningProcess();

    this.queue
      .filter((uploader: Uploader) => uploader.status === 'queue')
      .slice(0, Math.max(this.options.concurrency - running, 0))
      .forEach((uploader: Uploader) => {
        uploader.upload();
      });
  }

  /**
   * @returns number of active uploads
   */
  runningProcess(): number {
    return this.queue.filter(
      (uploader: Uploader) => uploader.status === 'uploading' || uploader.status === 'retry'
    ).length;
  }
}
