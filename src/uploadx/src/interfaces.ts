
export type UploadStatus =
  | 'added'
  | 'queue'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'cancelled'
  | 'paused';

export type UploadAction =
  | 'uploadAll'
  | 'upload'
  | 'cancel'
  | 'cancelAll'
  | 'pauseAll'
  | 'pause';
export interface UploadxControlEvent {
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
export interface UploadState {
  file: File;
  name: string;
  progress: number;
  remaining: number;
  response: any;
  size: number;
  speed: number;
  status: UploadStatus;
  uploadId: string;
}

export interface UploadItem {
  /**
   * Upload API initial method
   * @default 'POST'
   */
  method?: string;
  readonly uploadId?: string;
  /**
   * Upload API URL
   * @default '/upload/'
   */
  url?: string;
  /**
   * Custom headers
   */
  headers?: { [key: string]: string } | Function;
  /**
   * Upload meta
   * @default
   * { name: File.Filename, mimeType: File.type }
   */
  metadata?: any;
}
/**
 * Global Options
 */
export class UploadxOptions implements UploadItem {
  /**
   *  Set "accept" attribute
   * @example
   * allowedTypes: 'image/*, video/*'
   */
  allowedTypes?: string;
  /**
   * Auto upload with global options
   * @default true
   */
  autoUpload?: boolean;
  /**
   * If set use chunks for upload
   * @default 0
   */
  chunkSize?: number;
  /**
   * Uploads in parallel
   * @default 2
   */
  concurrency?: number;
  /**
   * Custom headers
   */
  headers?: { [key: string]: string } | Function;
  /**
   * Upload API initial method
   * @default 'POST'
   */
  method?: string;
  /**
   * Authorization Bearer token
   */
  token?: string;
  /**
   * Upload API URL
   * @default '/upload/'
   */
  url?: string;
  /**
   * Use withCredentials xhr option?
   * @default false
   */
  withCredentials?: boolean;
}
/**
 * @inner
 */
export interface UploaderOptions extends UploadItem {
  token?: string;
  chunkSize?: number;
  withCredentials?: boolean;
  readonly subj?: any;
  readonly nextFile?: () => void;
}
