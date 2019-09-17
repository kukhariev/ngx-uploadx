const PREFIX = 'UPLOADX-V3.0-';

class Store {
  constructor(public prefix = '') {}
  set(key: string, value: string) {
    localStorage.setItem(this.prefix + key, value);
  }
  get(key: string): string | null | false {
    return localStorage.getItem(this.prefix + key);
  }
  delete(key: string) {
    localStorage.removeItem(this.prefix + key);
  }
}
export const store = 'localStorage' in window ? new Store(PREFIX) : new Map<string, string>();
