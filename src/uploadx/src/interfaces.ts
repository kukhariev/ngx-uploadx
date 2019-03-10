export type UploadStatus =
  | 'added'
  | 'queue'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'retry';

export type UploadAction =
  | 'create'
  | 'refreshToken'
  | 'uploadAll'
  | 'upload'
  | 'cancel'
  | 'cancelAll'
  | 'pauseAll'
  | 'pause';

export interface UploadxControlEvent {
  token?: string | (() => string);
  action: UploadAction;
  /**
   * override global options
   */
  itemOptions?: UploadItem;
  /** Upload unique identifier */
  uploadId?: string;
}

/**
 *  Read only upload stream events
 */
export type UploadEvent = UploadState;

export interface UploadState {
  file: File;
  name: string;
  progress: number;
  percentage: number;
  remaining: number;
  response: any;
  responseStatus: number;
  size: number;
  speed: number;
  status: UploadStatus;
  uploadId: string;
  URI: string;
}

export interface UploadItem {
  /**
   * Upload API initial method
   * @defaultValue 'POST'
   */
  method?: string;
  readonly uploadId?: string;
  /**
   * Upload API URL
   * @defaultValue '/upload/'
   */
  endpoint?: string;
  /**
   * Upload API URL
   * @defaultValue '/upload/'
   * @deprecated Use {@link UploadItem.endpoint} instead.
   */
  url?: string;
  /**
   * Custom headers
   */
  headers?: { [key: string]: string } | ((file?: File) => { [key: string]: string });
  /**
   * Upload meta
   * @defaultValue
   * { name: File.Filename, mimeType: File.type }
   */
  metadata?: any;
  /**
   * Authorization Bearer token
   */
  token?: string | (() => string);
}
/**
 * Global Options
 */
export class UploadxOptions {
  /**
   *  Set "accept" attribute
   * @example
   * allowedTypes: 'image/*, video/*'
   */
  allowedTypes?: string;
  /**
   * Auto upload with global options
   * @defaultValue true
   */
  autoUpload?: boolean;
  /**
   * If set use chunks for upload
   * @defaultValue 0
   */
  chunkSize?: number;
  /**
   * Uploads in parallel
   * @defaultValue 2
   */
  concurrency?: number;
  /**
   * Custom headers
   */
  headers?: { [key: string]: string } | ((file?: File) => { [key: string]: string });
  /**
   * Upload API initial method
   * @defaultValue 'POST'
   */
  method?: string;
  /**
   * Authorization Bearer token
   */
  token?: string | (() => string);
  /**
   * Upload API URL
   * @defaultValue '/upload/'
   */
  endpoint?: string;
  /**
   * Upload API URL
   * @defaultValue '/upload/'
   * @deprecated Use {@link UploadxOptions.endpoint} instead.
   */
  url?: string;
  /**
   * Use withCredentials xhr option?
   * @defaultValue false
   */
  withCredentials?: boolean;
  /**
   * Max status 4xx retries
   * @defaultValue 3
   */
  maxRetryAttempts?: number;
}
