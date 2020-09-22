import { InjectionToken } from '@angular/core';
import { RequestOptions } from './interfaces';

export class RequestCanceler {
  onCancel: () => void = () => {};

  cancel(): void {
    this.onCancel();
    this.onCancel = () => {};
  }
}

export interface AjaxRequestConfig extends RequestOptions {
  data: BodyInit | null;
  responseType?: 'json' | 'text';
  onUploadProgress?: (evt: ProgressEvent) => void;
  withCredentials: boolean;
  canceler: RequestCanceler;
  validateStatus: (status: number) => boolean;
}

export interface Ajax {
  request: <T = string>(
    config: AjaxRequestConfig
  ) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
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
    data,
    headers = {},
    url = '/upload',
    responseType,
    canceler,
    onUploadProgress,
    withCredentials = false
  }: AjaxRequestConfig): Promise<{
    data: T;
    status: number;
    headers: Record<string, string>;
  }> => {
    const xhr = createXhr();
    canceler.onCancel = () => xhr && xhr.readyState !== xhr.DONE && xhr.abort();
    return new Promise((resolve, reject) => {
      xhr.open(method, url, true);
      xhr.responseType = responseType || '';
      withCredentials && (xhr.withCredentials = true);
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, String(headers[key])));
      xhr.upload.onprogress = onUploadProgress || null;
      xhr.onerror = xhr.ontimeout = xhr.onabort = evt => {
        releaseXhr(xhr);
        return reject({ error: evt.type, url, method });
      };
      xhr.onload = () => {
        const response = {
          data: getResponseBody<T>(xhr),
          status: xhr.status,
          headers: getResponseHeaders(xhr)
        };
        releaseXhr(xhr);
        return resolve(response);
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

function getResponseBody<T = string>(xhr: XMLHttpRequest, responseType?: 'json' | 'text'): T {
  let body = 'response' in (xhr as XMLHttpRequest) ? xhr.response : xhr.responseText;
  if (body && responseType === 'json' && typeof body === 'string') {
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
