import { BackoffRetry } from './backoff_retry';
import { UploadItem } from './interfaces';

export abstract class Uploader {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly uploadId = Math.random()
    .toString(36)
    .substring(2, 15);
  responseStatus: number;
  protected startTime: number;
  progress: number;
  remaining: number;
  speed: number;
  URI: string;
  headers: { [key: string]: string } | null;
  metadata: { [key: string]: any };
  endpoint = '/upload';
  protected maxRetryAttempts = 3;
  protected retry = new BackoffRetry();
  response: any;
  statusType: number;
  chunkSize: any;
  token: string | (() => string);
  protected _token: string;
  status: string;

  constructor(readonly file: File) {
    this.name = file.name;
    this.size = file.size;
    this.mimeType = file.type || 'application/octet-stream';
  }

  abstract upload(item?: UploadItem | undefined): Promise<void>;

  refreshToken(token?: any): void {
    this.token = token || this.token;
    this._token = this.unfunc(this.token);
  }
  /**
   * configure or reconfigure uploader
   */
  configure(item = {} as UploadItem): void {
    const { metadata, headers, token, endpoint } = item;
    this.metadata = {
      name: this.name,
      mimeType: this.mimeType,
      size: this.file.size,
      lastModified: this.file.lastModified,
      ...this.unfunc(metadata || this.metadata, this.file)
    };
    this.endpoint = endpoint || this.endpoint;
    this.refreshToken(token);
    this.headers = { ...this.headers, ...this.unfunc(headers, this.file) };
  }

  protected isMaxAttemptsReached(): boolean | never {
    if (this.retry.retryAttempts === this.maxRetryAttempts && this.statusType === 400) {
      this.retry.reset();
      console.error(
        `Error: Maximum number of retry attempts reached:
          file: ${this.name},
          statusCode: ${this.responseStatus}`
      );
      return true;
    }
  }

  protected unfunc<T>(value: T | ((file: File) => T), file?: File): T {
    return value instanceof Function ? value(file) : value;
  }
}
