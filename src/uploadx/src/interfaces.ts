import { Uploader } from './uploader';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

export type UploadStatus =
  | 'added'
  | 'queue'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'retry';

export type UploadAction = 'uploadAll' | 'upload' | 'cancel' | 'cancelAll' | 'pauseAll' | 'pause';

/**
 *  Read only upload stream events
 */
export type UploadEvent = UploadState;

export interface UploadState {
  file: File;
  name: string;
  progress: number;
  remaining: number;
  response: any;
  responseStatus: number;
  size: number;
  speed: number;
  status: UploadStatus;
  uploadId: string;
  url: string;
}

export interface UploadItem {
  readonly uploadId?: string;
  /**
   * URL to create new uploads.
   * @defaultValue '/upload'
   */
  endpoint?: string;
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
export interface UploadxControlEvent extends UploadItem {
  action?: UploadAction;
}
export interface UploaderOptions extends UploadItem {
  /**
   * Set a fixed chunk size.
   * If not specified, the optimal size will be automatically adjusted based on the network speed.
   */
  chunkSize?: number;
  withCredentials?: boolean;
  readonly stateChange?: (evt: UploadEvent) => void;
}
/**
 * Global Module Options
 */
export interface UploadxOptions extends UploaderOptions {
  /**
   * Provide a user-defined class to support another upload protocol or to extend an existing one.
   * @defaultValue UploadX
   */
  uploaderClass?: new (f: File, options: UploaderOptions) => Uploader;
  /**
   * Set the maximum parallel uploads
   * @defaultValue 2
   */
  concurrency?: number;
  /**
   * Automatically start upload when files added
   * @defaultValue true
   */
  autoUpload?: boolean;
  /**
   * File types the user can pick from the file input
   */
  allowedTypes?: string;
  /**
   * Add 'multiple' attribute
   * @defaultValue true
   */
  multiple?: boolean;
}
