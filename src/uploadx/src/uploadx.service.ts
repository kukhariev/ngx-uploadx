import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { UploadxOptions, UploadState, UploadxControlEvent, UploaderOptions } from './interfaces';
import { Uploader } from './uploader';
/**
 *
 */
@Injectable({ providedIn: 'root' })
export class UploadxService {
  subj: Subject<UploadState> = new Subject();
  queue: Uploader[] = [];
  private concurrency = 2;
  private autoUpload = true;
  private options: UploadxOptions;

  get uploaderOptions(): UploaderOptions {
    return {
      method: this.options.method || 'POST',
      // tslint:disable-next-line: deprecation
      endpoint: this.options.endpoint || this.options.url || '/upload/',
      headers: this.options.headers,
      token: this.options.token,
      chunkSize: this.options.chunkSize || 0,
      withCredentials: this.options.withCredentials || false,
      subj: this.subj,
      nextFile: () => this.processQueue()
    } as UploaderOptions;
  }
  /**
   * Set global module options
   */
  init(options: UploadxOptions): Observable<UploadState> {
    this.options = options;
    this.concurrency = options.concurrency || this.concurrency;
    this.autoUpload = options.autoUpload || false;
    return this.subj.asObservable();
  }
  /**
   *
   * Create Uploader and add to the queue
   */
  async handleFileList(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const uploader: Uploader = new Uploader(fileList.item(i), this.uploaderOptions);
      this.queue.push(uploader);
    }
    await this.autoUploadFiles();
  }
  /**
   *
   * Create Uploader for the file and add to the queue
   */
  async handleFile(file: File) {
    const uploader: Uploader = new Uploader(file, this.uploaderOptions);
    this.queue.push(uploader);
    await this.autoUploadFiles();
  }
  /**
   *
   * Auto upload the files if the flag is true
   */
  private async autoUploadFiles() {
    if (this.autoUpload) {
      this.processQueue();
    }
  }
  /**
   * Control upload status
   * @example
   * this.uploadService.control({ action: 'pauseAll' });
   *
   */
  control(event: UploadxControlEvent) {
    switch (event.action) {
      case 'cancelAll':
        this.queue.forEach(f => (f.status = 'cancelled'));
        break;
      case 'pauseAll':
        this.queue.forEach(f => (f.status = 'paused'));
        break;
      case 'refreshToken':
        this.queue.forEach(f => (f.options.token = event.token));
        break;
      case 'uploadAll':
        this.queue.filter(f => f.status !== 'uploading').forEach(f => (f.status = 'queue'));
        this.processQueue();
        break;
      case 'upload':
        const uploadId = event.uploadId || event.itemOptions.uploadId;
        // noinspection TsLint
        (this.concurrency - this.runningProcess() > 0) && this.queue.find(f => f.uploadId === uploadId).upload(event.itemOptions);
        this.processQueue();
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
   */
  private processQueue() {
    const running = this.runningProcess();

    this.queue
      .filter((uploader: Uploader) => uploader.status === 'queue')
      .slice(0, Math.max(this.concurrency - running, 0))
      .forEach((uploader: Uploader) => {
        uploader.upload();
      });
  }

  runningProcess(): number {
    return this.queue.filter((uploader: Uploader) => uploader.status === 'uploading').length;
  }
}
