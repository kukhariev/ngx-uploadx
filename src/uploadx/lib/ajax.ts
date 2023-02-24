import { InjectionToken } from '@angular/core';
import { RequestOptions } from './interfaces';

export interface AjaxRequestConfig extends RequestOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;

  data?: BodyInit | null;
  url: string;
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

function releaseXhr(_xhr: unknown): void {
  _xhr = null;
}

export class UploadxAjax {
  constructor(private buildXhr: () => XMLHttpRequest) {}

  request = <T = string>({
    method = 'GET',
    data = null,
    headers = {},
    url,
    responseType,
    signal,
    onUploadProgress,
    timeout = 0,
    withCredentials = false,
    validateStatus = status => status < 400 && status >= 200
  }: AjaxRequestConfig): Promise<AjaxResponse<T>> => {
    return new Promise((resolve, reject) => {
      const xhr = this.buildXhr();
      const abortListener = () => xhr && xhr.readyState !== xhr.DONE && xhr.abort();
      signal?.addEventListener('abort', abortListener, { once: true });
      xhr.open(method, url, true);
      xhr.timeout = timeout;
      withCredentials && (xhr.withCredentials = true);
      if (responseType) {
        xhr.responseType = responseType === 'json' ? 'text' : responseType;
      }
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, String(headers[key])));
      xhr.upload.onprogress = onUploadProgress || null;
      xhr.onerror =
        xhr.ontimeout =
        xhr.onabort =
          evt => {
            releaseXhr(xhr);
            signal?.removeEventListener('abort', abortListener);
            return reject({ error: evt.type, url, method });
          };
      xhr.onload = () => {
        const response = {
          data: this.getResponseBody<T>(xhr, responseType),
          status: xhr.status,
          headers: this.getResponseHeaders(xhr)
        };
        releaseXhr(xhr);
        signal?.removeEventListener('abort', abortListener);
        return validateStatus(response.status) ? resolve(response) : reject(response);
      };
      xhr.send(data as XMLHttpRequestBodyInit);
    });
  };

  getResponseHeaders(xhr: XMLHttpRequest): Record<string, string> {
    const rows = xhr.getAllResponseHeaders().split(/[\r\n]+/);
    return rows.reduce((headers: Record<string, string>, current) => {
      const [name, value] = current.split(': ');
      name && (headers[name.toLowerCase()] = value);
      return headers;
    }, {});
  }

  getResponseBody<T>(xhr: XMLHttpRequest, responseType?: string): T {
    if (responseType === 'document') {
      return typeof xhr.response === 'undefined' ? xhr.responseXML : xhr.response;
    }
    let body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
    if (responseType === 'json' && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    return body;
  }
}

export const UPLOADX_AJAX: InjectionToken<Ajax> = new InjectionToken('uploadx.ajax', {
  factory: () => new UploadxAjax(createXhr),
  providedIn: 'root'
});
