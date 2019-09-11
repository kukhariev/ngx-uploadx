const UPLOADX_KEY = 'UPLOADX_V3.0';
class FileStore {
  store: Record<string, string> = {};
  constructor() {
    const _all = localStorage.getItem(UPLOADX_KEY) || '{}';
    this.store = JSON.parse(_all);
  }

  set(id: string, data: any) {
    this.store[id] = data;
    localStorage.setItem(UPLOADX_KEY, JSON.stringify(this.store));
  }
  get(id: string) {
    return this.store[id];
  }
  remove(id: string) {
    delete this.store[id];
    localStorage.setItem(UPLOADX_KEY, JSON.stringify(this.store));
  }
}
export const store = new FileStore();
