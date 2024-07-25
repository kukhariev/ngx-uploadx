import { Ajax, AjaxRequestConfig } from './ajax';
import { Canceler } from './canceler';
import { DynamicChunk } from './dynamic-chunk';
import {
  AuthorizeRequest,
  Metadata,
  PreRequest,
  RequestConfig,
  RequestHeaders,
  RequestOptions,
  ResponseBody,
  UploadAction,
  UploaderOptions,
  UploadState,
  UploadStatus,
  UploadxControlEvent
} from './interfaces';
import { ErrorType, RetryHandler } from './retry-handler';
import { store } from './store';
import { isNumber, unfunc } from './utils';

const actionToStatusMap: { [K in UploadAction]: UploadStatus } = {
  pause: 'paused',
  upload: 'queue',
  cancel: 'cancelled',
  update: 'updated'
};

/**
 * Uploader Base Class
 */
export abstract class Uploader implements UploadState {
  name: string;
  readonly size: number;
  readonly uploadId!: string;
  response: ResponseBody = null;
  responseStatus = 0;
  responseHeaders: Record<string, string> = {};
  progress = 0;
  remaining!: number;
  speed = 0;
  /** Custom headers */
  headers: RequestHeaders = {};
  /** Metadata Object */
  metadata: Metadata;
  /** Upload endpoint */
  endpoint = '/upload';
  /** Chunk size in bytes */
  chunkSize = 0;
  /** Auth token/tokenGetter */
  token: UploadxControlEvent['token'];
  /** Byte offset within the whole file */
  offset?: number;
  /** Retries handler */
  retry: RetryHandler;
  canceler = new Canceler();
  abortController = new AbortController();
  /** Set HttpRequest responseType */
  responseType?: 'json' | 'text' | 'document';
  protected _authorize: AuthorizeRequest;
  protected _prerequest: PreRequest;
  private _eventsCount = 0;
  private _token!: string;

  constructor(
    readonly file: File,
    readonly options: Readonly<UploaderOptions>,
    readonly stateChange: (uploader: Uploader) => void,
    readonly ajax: Ajax
  ) {
    this.retry = new RetryHandler(options.retryConfig);
    this.name = file.name;
    this.size = file.size;
    this.metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      lastModified: file.lastModified
    };
    options.maxChunkSize && (DynamicChunk.maxSize = options.maxChunkSize);
    this._prerequest = options.prerequest || (req => req);
    this._authorize = options.authorize || (req => req);
    this.configure(options);
  }

  private _url = '';

  get url(): string {
    return this._url || store.get(this.uploadId) || '';
  }

  set url(value: string) {
    this._url !== value && store.set(this.uploadId, value);
    this._url = value;
  }

  private _status!: UploadStatus;

  get status(): UploadStatus {
    return this._status;
  }

  set status(s: UploadStatus) {
    if (s !== 'updated' && s !== 'cancelled') {
      if (this._status === s) return;
      if (this._status === 'complete') return;
    }
    if (this._status === 'cancelled') return;
    if (this._status === 'uploading' && s === 'queue') return;
    if (this._status === 'retry') this.retry.cancel();
    this._status = s;
    if (s === 'paused') this.abort();
    if (s === 'cancelled' || s === 'complete' || s === 'error') this.cleanup();
    if (s === 'cancelled') this.cancelAndSendState();
    else if (s === 'updated') this.updateAndSendState();
    else this.stateChange(this);
  }

  /**
   * Configure uploader
   */
  configure({ metadata, headers, token, endpoint, action }: UploadxControlEvent): void {
    endpoint && (this.endpoint = endpoint);
    token && (this.token = token);
    metadata && Object.assign(this.metadata, unfunc(metadata, this.file));
    headers && Object.assign(this.headers, unfunc(headers, this.file));
    action && (this.status = actionToStatusMap[action]);
  }

  /**
   * Starts uploading
   */
  async upload(): Promise<void> {
    do {
      this.status = 'uploading';
      try {
        this._token ||= await this.updateToken();
        this.url ||= await this.getFileUrl();
        if (this.offset !== this.size) {
          this.offset = isNumber(this.offset)
            ? await this.sendFileContent()
            : await this.getOffset();
        }
        this.retry.observe(this.offset);
        if (this.offset === this.size) {
          this.remaining = 0;
          this.progress = 100;
          this.status = 'complete';
        } else if (!isNumber(this.offset)) {
          this.stateChange(this);
          await this.retry.wait(this.getRetryAfterFromBackend() || this.retry.config.onBusyDelay);
        }
      } catch (e) {
        e instanceof Error && console.error(e);
        if (this.status !== 'uploading') {
          return;
        }
        switch (this.retry.kind(this.responseStatus)) {
          case ErrorType.Fatal:
            this.status = 'error';
            return;
          case ErrorType.NotFound:
            this.url = '';
            break;
          case ErrorType.Auth:
            this._token = '';
            break;
          default:
            if (unfunc(this.retry.config.keepPartial, this.responseStatus)) {
              this.offset = undefined;
            }
            this.status = 'retry';
            await this.retry.wait(this.getRetryAfterFromBackend());
        }
      }
    } while (['uploading', 'retry', 'updated'].includes(this._status));
  }

  /**
   * Performs http requests
   */
  async request(requestOptions: RequestOptions): Promise<void> {
    this.responseStatus = 0;
    this.response = null;
    this.responseHeaders = {};
    if (this.abortController.signal.aborted) {
      this.abortController = new AbortController();
    }
    const signal = requestOptions.signal || this.abortController.signal;
    let req: RequestConfig = {
      body: requestOptions.body || null,
      canceler: this.canceler,
      signal,
      headers: { ...this.headers, ...requestOptions.headers },
      method: requestOptions.method || 'GET',
      url: requestOptions.url || this.url
    };
    if (!requestOptions.skipAuthorization) {
      req = await this._authorize(req, this._token);
    }
    const { body = null, headers, method, url = req.url } = (await this._prerequest(req)) || req;
    const ajaxRequestConfig: AjaxRequestConfig = {
      method,
      headers: { ...req.headers, ...headers },
      url,
      data: body,
      responseType: this.options.responseType ?? this.responseType,
      withCredentials: !!this.options.withCredentials,
      canceler: this.canceler,
      signal,
      validateStatus: () => true,
      timeout: this.retry.config.timeout
    };
    if (isNumber(this.offset) && body && typeof body === 'object') {
      ajaxRequestConfig.onUploadProgress = this.onProgress();
    }
    const response = await this.ajax.request(ajaxRequestConfig);
    this.response = response.data;
    this.responseHeaders = response.headers;
    this.responseStatus = response.status;
    if (response.status >= 400) {
      return Promise.reject();
    }
  }

  /**
   * Set auth token string
   */
  updateToken = (): string | Promise<string> => {
    return unfunc(this.token || '', this.responseStatus);
  };

  /**
   * Get file URI
   */
  protected abstract getFileUrl(): Promise<string>;

  /**
   * Send file content and return an offset for the next request
   */
  protected abstract sendFileContent(): Promise<number | undefined>;

  /**
   * Get an offset for the next request
   */
  protected abstract getOffset(): Promise<number | undefined>;

  /**
   *  Updating the metadata of the upload
   */
  protected update<T = { metadata?: Metadata }>(_data: T): Promise<string> {
    return Promise.reject('Not implemented');
  }

  protected abort(): void {
    this.offset = undefined;
    this.abortController.abort();
    this.canceler.cancel();
  }

  protected async cancel(): Promise<void> {
    this.abort();
    if (this.url) {
      await this.request({ method: 'DELETE' }).catch(() => {});
    }
  }

  /**
   * Gets the value from the response
   */
  protected getValueFromResponse(key: string): string | null {
    return this.responseHeaders[key.toLowerCase()] || null;
  }

  /**
   * Get file chunk
   * @param offset - number of bytes of the file to skip
   * @param size - chunk size
   */
  getChunk(offset?: number, size?: number): { start: number; end: number; body: Blob } {
    if (this.responseStatus === 413) {
      DynamicChunk.maxSize = DynamicChunk.size = Math.floor(DynamicChunk.size / 2);
    }
    this.chunkSize =
      this.options.chunkSize === 0 ? this.size : this.options.chunkSize || DynamicChunk.size;
    const start = offset ?? this.offset ?? 0;
    const end = Math.min(start + (size || this.chunkSize), this.size);
    const body = this.file.slice(start, end);
    return { start, end, body };
  }

  private getRetryAfterFromBackend(): number {
    return Number(this.getValueFromResponse('retry-after')) * 1000;
  }

  private cancelAndSendState() {
    this.cancel().then(() => this.stateChange(this), console.error);
  }

  private updateAndSendState(): void {
    this.update({ metadata: this.metadata }).then(() => this.stateChange(this), console.error);
  }

  private cleanup = () => {
    store.delete(this._url);
    store.delete(this.uploadId);
  };

  private onProgress(): (evt: ProgressEvent) => void {
    let throttle: ReturnType<typeof setTimeout> | undefined;
    const startTime = Date.now();
    return ({ loaded }) => {
      const current = loaded / ((Date.now() - startTime) / 1000);
      this.speed = ~~((this.speed * this._eventsCount + current) / ++this._eventsCount);
      DynamicChunk.scale(this.speed);
      if (!throttle) {
        throttle = setTimeout(() => (throttle = undefined), 500);
        const uploaded = (this.offset || 0) + loaded;
        this.progress = +((uploaded / this.size) * 100).toFixed(2);
        this.remaining = ~~((this.size - uploaded) / this.speed);
        this.stateChange(this);
      }
    };
  }
}
