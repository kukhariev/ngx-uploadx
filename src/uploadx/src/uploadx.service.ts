import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UploaderOptions, UploadState, UploadxControlEvent, UploadxOptions } from './interfaces';
import { OnlineStatusListeners } from './online_status_listeners';
import { Uploader } from './uploader';
import { UploaderX } from './uploaderx';
import { pick } from './utils';

@Injectable({ providedIn: 'root' })
export class UploadxService {
  static stateKeys: (keyof UploadState)[] = [
    'file',
    'name',
    'progress',
    'remaining',
    'response',
    'responseStatus',
    'size',
    'speed',
    'status',
    'uploadId',
    'url'
  ];
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
    stateChange: (evt: Uploader) => {
      setTimeout(() =>
        this.ngZone.run(() => this.eventsStream.next(pick(evt, UploadxService.stateKeys)))
      );
    }
  };

  private onlineStatusListeners = new OnlineStatusListeners(
    () => this.control({ action: 'upload' }),
    () => this.control({ action: 'pause' })
  );

  constructor(private ngZone: NgZone) {
    this.events.subscribe(({ status }) => {
      if (status !== 'uploading' && status !== 'added') {
        this.ngZone.runOutsideAngular(() => this.processQueue());
      }
    });
  }

  /**
   * Initializes service
   * @param options global module options
   * @returns Observable that emits a new value on progress or status changes
   */
  init(options: UploadxOptions = {}): Observable<UploadState> {
    Object.assign(this.options, options);
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
    this.options.concurrency = instanceOptions.concurrency;
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

  private addUploaderInstance(file: File, options: UploadxOptions): void {
    const uploader = new (options.uploaderClass || UploaderX)(file, options as UploaderOptions);
    this.queue.push(uploader);
    uploader.status = 'added';
  }

  /**
   * Auto upload the files if the flag is true
   * @internal
   */
  private autoUploadFiles(): void {
    if (this.options.autoUpload && window.navigator.onLine) {
      this.queue
        .filter(({ status }) => status === 'added')
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
  control(evt: UploadxControlEvent): void {
    const target = evt.uploadId
      ? this.queue.filter(({ uploadId }) => uploadId === evt.uploadId)
      : this.queue;
    target.forEach(uploader => uploader.configure(evt));
  }

  /**
   * Queue management
   * @internal
   */
  private processQueue(): void {
    // Remove Cancelled Items from local queue
    this.queue = this.queue.filter(({ status }) => status !== 'cancelled');

    this.queue
      .filter(({ status }) => status === 'queue')
      .slice(0, Math.max((this.options.concurrency || 2) - this.runningProcess(), 0))
      .forEach(uploader => uploader.upload());
  }

  /**
   * @returns number of active uploads
   */
  runningProcess(): number {
    return this.queue.filter(({ status }) => status === 'uploading' || status === 'retry').length;
  }
}
