import { InjectionToken } from '@angular/core';
import { RequestOptions } from './interfaces';

export class RequestCanceler {
  onCancel = () => {};

  cancel(): void {
    this.onCancel();
    this.onCancel = () => {};
  }
}

export interface AjaxRequestConfig extends RequestOptions {
  // tslint:disable-next-line:no-any
  [x: string]: any;
  data?: BodyInit | null;
  responseType?: Exclude<XMLHttpRequestResponseType, ''>; // axios/gaxios type compat
  onUploadProgress?: (evt: ProgressEvent) => void;
  withCredentials?: boolean;
  canceler?: RequestCanceler;
  validateStatus?: (status: number) => boolean;
}

export interface AjaxResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface Ajax {
  request: <T = string>(config: AjaxRequestConfig) => Promise<AjaxResponse<T>>;
}

function createXhr(): XMLHttpRequest {
  return new XMLHttpRequest();
}

function releaseXhr(xhr: unknown): void {
  xhr = null;
}

export const ajax: Ajax = {
  request: <T = string>({
    method,
    data = null,
    headers = {},
    url = '/upload',
    responseType,
    canceler,
    onUploadProgress,
    withCredentials = false,
    validateStatus = status => status < 400 && status >= 200
  }: AjaxRequestConfig): Promise<AjaxResponse<T>> => {
    const xhr = createXhr();
    canceler && (canceler.onCancel = () => xhr && xhr.readyState !== xhr.DONE && xhr.abort());
    return new Promise((resolve, reject) => {
      xhr.open(method, url, true);
      withCredentials && (xhr.withCredentials = true);
      responseType && (xhr.responseType = responseType);
      responseType === 'json' && (headers.Accept = 'application/json');
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, String(headers[key])));
      xhr.upload.onprogress = onUploadProgress || null;
      xhr.onerror = xhr.ontimeout = xhr.onabort = evt => {
        releaseXhr(xhr);
        return reject({ error: evt.type, url, method });
      };
      xhr.onload = () => {
        const response = {
          data: getResponseBody<T>(xhr, responseType === 'json'),
          status: xhr.status,
          headers: getResponseHeaders(xhr)
        };
        releaseXhr(xhr);
        return validateStatus(response.status) ? resolve(response) : reject(response);
      };
      xhr.send(data);
    });
  }
};

function getResponseHeaders(xhr: XMLHttpRequest): Record<string, string> {
  const rows = xhr.getAllResponseHeaders().split('\r\n');
  return rows.reduce((headers: Record<string, string>, current) => {
    const [name, value] = current.split(': ');
    name && (headers[name] = value);
    return headers;
  }, {});
}

function getResponseBody<T = string>(xhr: XMLHttpRequest, isJson: boolean): T {
  let body = 'response' in (xhr as XMLHttpRequest) ? xhr.response : xhr.responseText;
  if (body && isJson && typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }
  return body;
}

export const UPLOADX_AJAX: InjectionToken<Ajax> = new InjectionToken('uploadx.ajax', {
  factory: () => ajax,
  providedIn: 'root'
});
