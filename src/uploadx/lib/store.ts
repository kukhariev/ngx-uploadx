class Store {
  prefix = 'UPLOADX-V3.0-';

  set(key: string, value: string): void {
    localStorage.setItem(this.prefix + key, value);
  }

  get(key: string): string | null {
    return localStorage.getItem(this.prefix + key);
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}

export const store =
  typeof window !== 'undefined' && 'localStorage' in window
    ? new Store()
    : new Map<string, string>();
