/* eslint-disable no-bitwise */

import { Primitive } from './interfaces';

function safeMatch(base: string, re: RegExp): string {
  return (base.match(re) || [])[0] || '';
}

export function resolveUrl(url: string, base: string): string {
  if (url.indexOf('https://') * url.indexOf('http://') === 0) {
    return url;
  }
  if (url.indexOf('//') === 0) {
    return safeMatch(base, /^(https?:)/) + url;
  }
  if (url.indexOf('/') === 0) {
    return safeMatch(base, /^(?:https?:)?(?:\/\/)?([^\/\?]+)/) + url;
  }
  return safeMatch(base, /^(?:https?:)?(?:\/\/)?([^\/\?]+)?(.*\/)/) + url;
}

export function unfunc<T, V>(value: T | ((ref: V) => T), ref: V): T {
  return value instanceof Function ? value(ref) : value;
}

export const pick = <T, K extends keyof T>(obj: T, props: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  props.forEach(key => (result[key] = obj[key]));
  return result;
};

export function isNumber(x?: number): x is number {
  return x === Number(x);
}

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
  return hash >>> 0;
}

export const b64 = {
  encode: (str: string) =>
    btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(Number.parseInt(p1, 16))
      )
    ),
  decode: (str: string) =>
    decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ),
  serialize: (obj: Record<string, Primitive | Primitive[]>) =>
    Object.keys(obj)
      .map(key => `${key} ${b64.encode(String(obj[key]))}`)
      .toString(),

  parse: (encoded: string) => {
    const kvPairs = encoded.split(',').map(kv => kv.split(' '));
    const decoded: Record<string, string> = Object.create(null);
    for (const [key, value] of kvPairs) {
      decoded[key] = b64.decode(value);
    }
    return decoded;
  }
};

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.platform)
    ? true
    : !!(
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)
      );
}

export function onLine(): boolean {
  return typeof window !== 'undefined' ? window.navigator.onLine : true;
}
