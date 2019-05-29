import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UploaderOptions, UploadxControlEvent, UploadxOptions, UploadState } from './interfaces';
import { Uploader } from './uploader';
import { UploaderX } from './uploaderx';

@Injectable({ providedIn: 'root' })
export class UploadxService {
  private uploaderClass: new (f: File, options: UploaderOptions) => Uploader;
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
    this.events.subscribe((evt: UploadState) => {
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
    return this.events;
  }
  /**
   * Initializes service
   * @param options global options
   * @returns Observable that emits the current array of uploaders
   */
  connect(options?: UploadxOptions): Observable<Uploader[]> {
    return this.init(options).pipe(
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
  handleFileList(fileList: FileList, options = {}): void {
    const instanceOptions = { ...this.options, ...options };
    Array.from(fileList).forEach(file => this.addUploaderInstance(file, instanceOptions));
    this.autoUploadFiles();
  }

  /**
   * Create Uploader for the file and add to the queue
   */
  handleFile(file: File, options = {}): void {
    const instanceOptions = { ...this.options, ...options };
    this.addUploaderInstance(file, instanceOptions);
    this.autoUploadFiles();
  }

  private addUploaderInstance(file: File, options: UploadxOptions) {
    this.uploaderClass = options.uploaderClass;
    const uploader = new this.uploaderClass(file, options as UploaderOptions);
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
   * Uploads control
   * @example
   * this.uploadService.control({ action: 'pause' });
   */
  control(event: UploadxControlEvent): void {
    const uploadId = event.uploadId;
    const target = uploadId ? this.queue.filter(f => f.uploadId === uploadId) : this.queue;
    target.forEach(f => f.configure(event));
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
