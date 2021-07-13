class Store {
  prefix = 'UPLOADX-V3.0-';

  set(key: string, value: string): this {
    localStorage.setItem(this.prefix + key, value);
    return this;
  }

  get(key: string): string | null {
    return localStorage.getItem(this.prefix + key);
  }

  delete(key: string): boolean {
    localStorage.removeItem(this.prefix + key);
    return true;
  }

  clear(): void {
    Object.keys(localStorage).forEach(
      key => key.startsWith(this.prefix) && localStorage.removeItem(key)
    );
  }
}

export const store = isLocalStorageAvailable() ? new Store() : new Map<string, string>();

function isLocalStorageAvailable(): boolean {
  try {
    const key = 'uploadxLocalStorageTest';
    const value = 'value';
    localStorage.setItem(key, value);
    const getValue = localStorage.getItem(key);
    localStorage.removeItem(key);
    return getValue === value;
  } catch {
    return false;
  }
}
