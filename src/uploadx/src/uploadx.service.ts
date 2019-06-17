import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UploaderOptions, UploadxControlEvent, UploadxOptions, UploadState } from './interfaces';
import { Uploader } from './uploader';
import { UploaderX } from './uploaderx';

@Injectable({ providedIn: 'root' })
export class UploadxService {
  private readonly eventsStream: Subject<UploadState> = new Subject();
  /**
   * Upload status events
   */
  get events() {
    return this.eventsStream.asObservable();
  }
  /**
   * Array of the upload queue
   */
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
   * @param options global module options
   * @returns Observable that emits a new value on progress or status changes
   */
  init(options: UploadxOptions): Observable<UploadState> {
    this.options = { ...this.options, ...options };
    return this.events;
  }

  /**
   * Initializes service
   * @param options global module options
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
    this.queue.forEach(uploader => (uploader.status = 'paused'));
    this.queue = [];
  }

  /**
   * Create Uploader and add to the queue
   */
  handleFileList(fileList: FileList, options = {} as UploadxOptions): void {
    const instanceOptions = { ...this.options, ...options };
    Array.from(fileList).forEach(file => this.addUploaderInstance(file, instanceOptions));
    this.autoUploadFiles();
  }

  /**
   * Create Uploader for the file and add to the queue
   */
  handleFile(file: File, options = {} as UploadxOptions): void {
    const instanceOptions = { ...this.options, ...options };
    this.addUploaderInstance(file, instanceOptions);
    this.autoUploadFiles();
  }

  private addUploaderInstance(file: File, options: UploadxOptions) {
    const uploader = new this.options.uploaderClass(file, options as UploaderOptions);
    this.queue.push(uploader);
    uploader.status = 'added';
  }

  /**
   * Auto upload the files if the flag is true
   * @internal
   */
  private autoUploadFiles(): void {
    if (this.options.autoUpload) {
      this.queue
        .filter(uploader => uploader.status === 'added')
        .forEach(uploader => (uploader.status = 'queue'));
    }
  }

  /**
   * Upload control
   * @example
   * // pause all
   * this.uploadService.control({ action: 'pause' });
   * // pause upload with uploadId
   * this.uploadService.control({ action: 'pause', uploadId});
   * // set token
   * this.uploadService.control({ token: `TOKEN` });
   */
  control(event: UploadxControlEvent): void {
    const uploadId = event.uploadId;
    const target = uploadId
      ? this.queue.filter(uploader => uploader.uploadId === uploadId)
      : this.queue;
    target.forEach(uploader => uploader.configure(event));
  }

  /**
   * Queue management
   * @internal
   */
  private processQueue(): void {
    // Remove Cancelled Items from local queue
    this.queue = this.queue.filter(f => f.status !== 'cancelled');

    this.queue
      .filter(uploader => uploader.status === 'queue')
      .slice(0, Math.max(this.options.concurrency - this.runningProcess(), 0))
      .forEach(uploader => uploader.upload());
  }

  /**
   * @returns number of active uploads
   */
  runningProcess(): number {
    return this.queue.filter(
      uploader => uploader.status === 'uploading' || uploader.status === 'retry'
    ).length;
  }
}
