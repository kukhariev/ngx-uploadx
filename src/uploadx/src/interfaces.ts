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
   * @defaultValue '/upload'
   */
  endpoint?: string;
  /**
   * Upload API URL
   * @defaultValue '/upload'
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
   *
  ```ts
   {
    name: File.Filename,
    mimeType: File.type,
    size: File.size,
    lastModified: File.lastModified
   }
  ```
   */
  metadata?: { [key: string]: any } | ((file?: File) => { [key: string]: any });
  /**
   * Authorization Bearer token
   */
  token?: string | (() => string);
}
/**
 * Global Options
 */
export interface UploadxOptions extends UploadItem {
  maxRetryAttempts?: number;
  chunkSize?: number;
  withCredentials?: boolean;
  readonly stateChange?: any;
  concurrency?: number;
  autoUpload?: boolean;
  allowedTypes?: any;
}
