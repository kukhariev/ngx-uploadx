function safeMatch(base: string, re: RegExp): string {
  return (base.match(re) || [''])[0];
}

export function resolveUrl(url: string, base: string): string {
  if (url.indexOf('https://') * url.indexOf('http://') === 0) return url;
  if (url.indexOf('//') === 0) return safeMatch(base, /^(https?:)/) + url;
  if (url.indexOf('/') === 0) return safeMatch(base, /^(?:https?:)?(?:\/\/)?([^\/?]+)/) + url;
  return safeMatch(base, /^(?:https?:)?(?:\/\/)?([^\/?]+)?(.*\/)/) + url;
}

/**
 * Unwraps a value if it is a function, otherwise returns the value directly.
 * Useful for allowing values to optionally be specified as functions.
 */
export function unfunc<T, V>(value: T | ((ref: V) => T), ref: V): T {
  return value instanceof Function ? value(ref) : value;
}

export const pick = <T, K extends keyof T>(obj: T, props: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  props.forEach(key => (result[key] = obj[key]));
  return result;
};

export function isNumber(x?: unknown): x is number {
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

/**
 * Utility functions for base64 encoding and decoding strings and objects.
 */
export const b64 = {
  encode: (str: string): string =>
    btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(Number.parseInt(p1, 16))
      )
    ),
  decode: (str: string): string =>
    decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ),

  serialize: (obj: Record<string, unknown>): string =>
    Object.keys(obj)
      .map(key => [key, b64.encode(String(obj[key]))].filter(Boolean).join(' '))
      .toString(),

  parse: (encoded: string): Record<string, string> => {
    const kvPairs = encoded.split(',').map(kv => kv.split(' '));
    const decoded: Record<string, string> = {};
    for (const [key, value] of kvPairs) {
      if (key) decoded[key] = value ? b64.decode(value) : '';
    }
    return decoded;
  }
};

export function isBrowser(): boolean {
  return ![typeof window, typeof navigator].includes('undefined');
}

export function onLine(): boolean {
  return isBrowser() ? navigator.onLine : true;
}

export function isIOS(): boolean {
  return isBrowser() && /iPad|iPhone/.test(navigator.userAgent);
}

export function osVersion() {
  const m = /OS (\d+)_(\d+)_?(\d+)?/.exec(navigator.userAgent);
  if (m?.length) return m[1] + '.' + m[2] + '.' + m[3] || '0';
  return;
}

export function compareVersions(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}

export function isBadIOS() {
  return isIOS() && compareVersions(osVersion() || '0.0', '15.3') < 0;
}

/**
 * [Big files upload error with iOS](https://github.com/kukhariev/ngx-uploadx/issues/316)
 * TODO: move to app
 */
export const iosOverride = isBadIOS()
  ? { chunkSize: 0, retryConfig: { shouldRetry: () => false } }
  : {};
