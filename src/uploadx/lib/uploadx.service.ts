import { Inject, Injectable, NgZone, OnDestroy, Optional } from '@angular/core';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Ajax, UPLOADX_AJAX } from './ajax';
import { UploadState, UploadxControlEvent } from './interfaces';
import {
  UPLOADX_FACTORY_OPTIONS,
  UPLOADX_OPTIONS,
  UploadxFactoryOptions,
  UploadxOptions
} from './options';
import { Uploader } from './uploader';
import { pick } from './utils';

const stateKeys: Array<keyof UploadState> = [
  'file',
  'name',
  'progress',
  'remaining',
  'response',
  'responseHeaders',
  'responseStatus',
  'size',
  'speed',
  'status',
  'uploadId',
  'url'
];

@Injectable({ providedIn: 'root' })
export class UploadxService implements OnDestroy {
  /** Upload Queue */
  queue: Uploader[] = [];
  options: UploadxFactoryOptions;
  private readonly eventsStream: Subject<UploadState> = new Subject();
  private subs: Subscription[] = [];

  /** Upload status events */
  get events(): Observable<UploadState> {
    return this.eventsStream.asObservable();
  }

  constructor(
    @Optional() @Inject(UPLOADX_OPTIONS) options: UploadxOptions | null,
    @Inject(UPLOADX_FACTORY_OPTIONS) defaults: UploadxFactoryOptions,
    @Inject(UPLOADX_AJAX) readonly ajax: Ajax,
    private ngZone: NgZone
  ) {
    this.options = Object.assign({}, defaults, options);
    // TODO: add 'offline' status
    // FIXME: online/offline not supported on Windows
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
      startWith({} as UploadState),
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
   * Creates loaders for files and adds them to the queue
   */
  handleFiles(files: FileList | File | File[], options = {} as UploadxOptions): void {
    const instanceOptions: UploadxFactoryOptions = { ...this.options, ...options };
    this.options.concurrency = instanceOptions.concurrency;
    ('name' in files ? [files] : Array.from(files)).forEach(file =>
      this.addUploaderInstance(file, instanceOptions)
    );
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

  private stateChange = (evt: UploadState) => {
    setTimeout(() => this.ngZone.run(() => this.eventsStream.next(pick(evt, stateKeys))));
  };

  private addUploaderInstance(file: File, options: UploadxFactoryOptions): void {
    const uploader = new options.uploaderClass(file, options, this.stateChange, this.ajax);
    this.queue.push(uploader);
    uploader.status = options.autoUpload && window.navigator.onLine ? 'queue' : 'added';
  }

  private processQueue(): void {
    this.queue = this.queue.filter(({ status }) => status !== 'cancelled');
    this.queue
      .filter(({ status }) => status === 'queue')
      .slice(0, Math.max(this.options.concurrency - this.runningProcess(), 0))
      .forEach(uploader => uploader.upload());
  }
}
