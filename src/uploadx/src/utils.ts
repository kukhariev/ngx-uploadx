// tslint:disable: no-bitwise
import { UploadAction, UploadStatus } from './interfaces';

export function resolveUrl(url: string, baseURI: string) {
  if (url.indexOf('//') * url.indexOf('https://') * url.indexOf('http://') === 0) {
    return url;
  }
  try {
    const res = new URL(url, baseURI).href;
    return res;
  } catch {
    if (url.indexOf('/') === 0) {
      const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)/g);
      const origin = matches && matches[0];
      return origin + url;
    } else {
      const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)?(.*\/)/g);
      const path = matches && matches[0];
      return path + url;
    }
  }
}

export function unfunc<T, V>(value: T | ((ref: V) => T), ref: V): T {
  return value instanceof Function ? value(ref) : value;
}

export const noop = () => {};

export const pick = <T, K extends keyof T>(obj: T, whitelist: K[]): Pick<T, K> => {
  const result: any = {};
  whitelist.forEach(key => (result[key] = obj[key]));
  return result;
};

export function isNumber(x: any): x is number {
  return typeof x === 'number';
}

export function isString(x: any): x is string {
  return typeof x === 'string';
}

export const actionToStatusMap: { [K in UploadAction]: UploadStatus } = {
  pause: 'paused',
  pauseAll: 'paused',
  upload: 'queue',
  uploadAll: 'queue',
  cancel: 'cancelled',
  cancelAll: 'cancelled'
};

/**
 * 32-bit FNV-1a hash function
 */
export function createHash(str: string): number {
  let hash = 2166136261;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash;
}
export function b64Encode(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}
export function b64Decode(str: string) {
  return decodeURIComponent(escape(window.atob(str)));
}
export function objectToB64String(obj: Record<string, any>) {
  return Object.entries(obj)
    .map(([key, value]) => `${key} ${b64Encode(String(value))}`)
    .toString();
}
