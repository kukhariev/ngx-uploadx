import { Uploader } from './uploader';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

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
export type UploadEvent = Readonly<UploadState>;

export interface UploadState {
  /** Uploaded file */
  readonly file: File;

  /** Original file name */
  readonly name: string;

  /** Progress percentage */
  readonly progress: number;

  /** Estimated remaining time */
  readonly remaining: number;

  /** HTTP response body */
  readonly response: any;

  /** HTTP response status code */
  readonly responseStatus: number;

  /** File size in bytes */
  readonly size: number;

  /** Upload speed bytes/sec */
  readonly speed: number;

  /** Upload status */
  readonly status: UploadStatus;

  /** Unique upload id */
  readonly uploadId: string;

  /** File url */
  readonly url: string;
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
  headers?: Record<string, string> | ((file?: File) => Record<string, string>);
  /**
   * Custom uploads metadata
   */
  metadata?: Record<string, any> | ((file?: File) => Record<string, any>);
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

export interface RequestParams {
  method: HttpMethod;
  body?: string | Blob | null;
  url?: string;
  headers?: Record<string, string>;
}
