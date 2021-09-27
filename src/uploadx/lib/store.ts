const HOUR = 1000 * 60 * 60;

export class Store<T = string> {
  private ttl = 24 * HOUR;
  constructor(readonly prefix = 'UPLOADX-v4.0-') {}

  set(key: string, value: T): void {
    this.ttl &&
      localStorage.setItem(this.prefix + key, JSON.stringify([value, Date.now() + this.ttl]));
  }

  get(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    if (item) {
      const [value, expires] = JSON.parse(item);
      return value && expires ? value : null;
    }
    return null;
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(maxAgeHours = 0): void {
    this.ttl = maxAgeHours * HOUR;
    const now = Date.now();
    this.keys().forEach(key => {
      const item = localStorage.getItem(key);
      if (item && maxAgeHours) {
        const [, expires] = JSON.parse(item);
        now > Number(expires) && localStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    });
  }

  private keys(): string[] {
    return Object.keys(localStorage).filter(key => key.indexOf(this.prefix) === 0);
  }
}

export const store = isLocalStorageAvailable() ? new Store() : new Map<string, string>();

export function isLocalStorageAvailable(): boolean {
  try {
    const key = 'LocalStorageTest';
    const value = 'value';
    localStorage.setItem(key, value);
    const getValue = localStorage.getItem(key);
    localStorage.removeItem(key);
    return getValue === value;
  } catch {
    return false;
  }
}
