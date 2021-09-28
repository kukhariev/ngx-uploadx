import { Ajax } from './ajax';
import { Canceler } from './canceler';
import { RetryConfig } from './retry-handler';
import { Uploader } from './uploader';

export type Primitive = null | boolean | number | string;

// tslint:disable-next-line:no-any
export type ResponseBody = any;

export type RequestHeaders = Record<string, Primitive | Primitive[]>;

export type Metadata = Record<string, Primitive | Primitive[]>;

export interface RequestConfig {
  body?: BodyInit | null;
  canceler: Canceler;
  headers: RequestHeaders;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  onUploadProgress?: (evt: ProgressEvent) => void;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  url: string;
  validateStatus?: (status: number) => boolean;
  withCredentials?: boolean;
}

export type RequestOptions = Partial<RequestConfig>;
export type AuthorizeRequest = (
  req: RequestConfig,
  token?: string
) => RequestConfig | Promise<RequestConfig>;

export type PreRequest = (req: RequestConfig) => Promise<RequestOptions> | RequestOptions | void;

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
  headers?: RequestHeaders | ((file: File) => RequestHeaders);
  /**
   * Custom uploads metadata
   */
  metadata?: Metadata | ((file: File) => Metadata);
  /**
   * Authorization token as a `string` or function returning a `string` or `Promise<string>`
   */
  token?: string | ((httpStatus: number) => string | Promise<string>);
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
  /** Adaptive chunk size limit */
  maxChunkSize?: number;
  withCredentials?: boolean;
  /**
   * Function called before every request
   */
  prerequest?: PreRequest;
  /**
   * Function used to apply authorization token
   */
  authorize?: AuthorizeRequest;
}

export type UploaderClass = new (
  file: File,
  options: UploaderOptions,
  stateChange: (evt: UploadState) => void,
  ajax: Ajax
) => Uploader;

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
