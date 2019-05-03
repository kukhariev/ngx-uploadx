import { Uploader } from './uploader';

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
  token?: string | ((httpStatus?: number) => string);
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
  readonly uploadId?: string;
  /**
   * URL to create new uploads.
   * @defaultValue '/upload'
   */
  endpoint?: string;
  /**
   * URL to create new uploads.
   * @defaultValue '/upload'
   * @deprecated Use {@link UploadItem.endpoint} instead.
   */
  url?: string;
  /**
   * Headers to be appended to each HTTP request
   */
  headers?: { [key: string]: string } | ((file?: File) => { [key: string]: string });
  /**
   * Custom uploads metadata
   */
  metadata?: { [key: string]: any } | ((file?: File) => { [key: string]: any });
  /**
   * Authorization  token as a `string` or function returning a `string` or `Promise<string>`
   */
  token?: string | ((httpStatus?: number) => string | Promise<string>);
}
export interface UploaderOptions extends Pick<UploadItem, Exclude<keyof UploadItem, 'uploadId'>> {
  /**
   * Set a fixed chunk size.
   * If not specified, the optimal size will be automatically adjusted based on the network speed.
   */
  chunkSize?: number;
  withCredentials?: boolean;
  readonly stateChange?: (evt: UploadState) => void;
}
/**
 * Global Options
 */
export interface UploadxOptions extends UploaderOptions {
  /**
   * Provide a user-defined class to support another upload protocol or to extend an existing one.
   */
  uploaderClass?: new (f: File, options: UploadxOptions) => Uploader;
  /**
   * Set the maximum parallel uploads
   */
  concurrency?: number;
  /**
   * Automatically start upload when files added
   */
  autoUpload?: boolean;
  allowedTypes?: any;
}
