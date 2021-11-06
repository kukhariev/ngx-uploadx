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

function releaseXhr(xhr: unknown): void {
  xhr = null;
}

export class UploadxAjax {
  constructor(private buildXhr: () => XMLHttpRequest) {}

  request = <T = string>({
    method = 'GET',
    data = null,
    headers = {},
    url,
    responseType,
    canceler,
    onUploadProgress,
    timeout = 0,
    withCredentials = false,
    validateStatus = status => status < 400 && status >= 200
  }: AjaxRequestConfig): Promise<AjaxResponse<T>> => {
    const xhr = this.buildXhr();
    canceler && (canceler.onCancel = () => xhr && xhr.readyState !== xhr.DONE && xhr.abort());
    return new Promise((resolve, reject) => {
      xhr.open(method, url, true);
      xhr.timeout = timeout;
      withCredentials && (xhr.withCredentials = true);
      responseType && (xhr.responseType = responseType);
      responseType === 'json' && !headers['Accept'] && (headers['Accept'] = 'application/json');
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, String(headers[key])));
      xhr.upload.onprogress = onUploadProgress || null;
      xhr.onerror =
        xhr.ontimeout =
        xhr.onabort =
          evt => {
            releaseXhr(xhr);
            return reject({ error: evt.type, url, method });
          };
      xhr.onload = () => {
        const response = {
          data: this.getResponseBody<T>(xhr, responseType === 'json'),
          status: xhr.status,
          headers: this.getResponseHeaders(xhr)
        };
        releaseXhr(xhr);
        return validateStatus(response.status) ? resolve(response) : reject(response);
      };
      xhr.send(data);
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

  getResponseBody<T = string>(xhr: XMLHttpRequest, json?: boolean): T {
    let body = 'response' in (xhr as XMLHttpRequest) ? xhr.response : xhr.responseText;
    if (body && json && typeof body === 'string') {
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
