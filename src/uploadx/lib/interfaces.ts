import { InjectionToken } from '@angular/core';
import { Ajax } from './ajax';
import { RetryConfig } from './error-handler';
import { Uploader } from './uploader';

export type Primitive = null | boolean | number | string;

export type ResponseBody = string | object | null;

export type RequestHeaders = Record<string, Primitive | Primitive[]>;

export type Metadata = Record<string, Primitive | Primitive[]>;

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  body?: BodyInit | null;
  url?: string;
  headers?: RequestHeaders;
  progress?: boolean;
}

export type UploadStatus =
  | 'added'
  | 'queue'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'retry';

export type UploadAction = 'upload' | 'cancel' | 'pause';

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
  readonly response: ResponseBody;

  /** HTTP response status code */
  readonly responseStatus: number;

  /** HTTP response headers */
  readonly responseHeaders: Record<string, string>;

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

interface UploadItem {
  /**
   * URL to create new uploads.
   * @defaultValue '/upload'
   */
  endpoint?: string;
  /**
   * Headers to be appended to each HTTP request
   */
  headers?: RequestHeaders | ((file?: File) => RequestHeaders);
  /**
   * Custom uploads metadata
   */
  metadata?: Metadata | ((file?: File) => Metadata);
  /**
   * Authorization  token as a `string` or function returning a `string` or `Promise<string>`
   */
  token?: string | ((httpStatus?: number) => string | Promise<string>);
}

export interface UploadxControlEvent extends UploadItem {
  readonly uploadId?: string;
  action?: UploadAction;
}

export interface UploaderOptions extends UploadItem {
  retryConfig?: RetryConfig;
  /**
   * Set a fixed chunk size.
   * If not specified, the optimal size will be automatically adjusted based on the network speed.
   */
  chunkSize?: number;
  withCredentials?: boolean;
  /**
   * Function called before every request
   */
  prerequest?: (req: RequestOptions) => Promise<RequestOptions> | RequestOptions | void;
}

export type UploaderClass = new (
  file: File,
  options: UploaderOptions,
  stateChange: (evt: UploadEvent) => void,
  ajax: Ajax
) => Uploader;

/**
 * Global Module Options
 */
export interface UploadxOptions extends UploaderOptions {
  /**
   * Provide a user-defined class to support another upload protocol or to extend an existing one.
   * @defaultValue UploadX
   */
  uploaderClass?: UploaderClass;
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

export const UPLOADX_OPTIONS = new InjectionToken<UploadxOptions>('uploadx.options');
