import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UploaderOptions, UploadState, UploadxControlEvent, UploadxOptions } from './interfaces';
import { Uploader } from './uploader';
import { UploaderX } from './uploaderx';
import { pick } from './utils';

interface DefaultOptions {
  endpoint: string;
  autoUpload: boolean;
  concurrency: number;
  stateChange: (evt: Uploader) => void;
}

@Injectable({ providedIn: 'root' })
export class UploadxService implements OnDestroy {
  static stateKeys: Array<keyof UploadState> = [
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
  /** Upload status events */
  get events() {
    return this.eventsStream.asObservable();
  }
  /** Upload Queue */
  queue: Uploader[] = [];
  options: UploadxOptions & DefaultOptions = {
    endpoint: '/upload',
    autoUpload: true,
    concurrency: 2,
    stateChange: (evt: Uploader) => {
      setTimeout(() =>
        this.ngZone.run(() => this.eventsStream.next(pick(evt, UploadxService.stateKeys)))
      );
    }
  };

  private readonly eventsStream: Subject<UploadState> = new Subject();
  private subs: Subscription[] = [];
  constructor(private ngZone: NgZone) {
    this.subs.push(
      fromEvent(window, 'online').subscribe(() => this.control({ action: 'upload' })),
      fromEvent(window, 'offline').subscribe(() => this.control({ action: 'pause' })),
      this.events.subscribe(({ status }) => {
        if (status !== 'uploading' && status !== 'added') {
          this.ngZone.runOutsideAngular(() => this.processQueue());
        }
      })
    );
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

  ngOnDestroy(): void {
    this.disconnect();
    this.subs.forEach(sub => sub.unsubscribe());
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
   * Returns number of active uploads
   */
  runningProcess(): number {
    return this.queue.filter(({ status }) => status === 'uploading' || status === 'retry').length;
  }

  private addUploaderInstance(file: File, options: UploadxOptions): void {
    const uploader = new (options.uploaderClass || UploaderX)(file, options as UploaderOptions);
    this.queue.push(uploader);
    uploader.status = 'added';
  }

  private autoUploadFiles(): void {
    if (this.options.autoUpload && window.navigator.onLine) {
      this.queue
        .filter(({ status }) => status === 'added')
        .forEach(uploader => (uploader.status = 'queue'));
    }
  }

  private processQueue(): void {
    this.queue = this.queue.filter(({ status }) => status !== 'cancelled');

    this.queue
      .filter(({ status }) => status === 'queue')
      .slice(0, Math.max(this.options.concurrency - this.runningProcess(), 0))
      .forEach(uploader => uploader.upload());
  }
}
