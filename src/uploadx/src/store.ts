const UPLOADX_KEY = 'UPLOADX_V3.0';
class Store<T> {
  store: Map<string, T> = new Map<string, T>();
  constructor(public key: string) {
    const raw = localStorage.getItem(this.key) || '[]';
    this.store = new Map(JSON.parse(raw));
  }
  clear() {
    this.store.clear();
    localStorage.removeItem(this.key);
  }
  set(id: string, data: T) {
    this.store.set(id, data);
    localStorage.setItem(this.key, JSON.stringify(Array.from(this.store)));
    return this;
  }
  get(id: string) {
    return this.store.get(id);
  }
  delete(id: string) {
    const has = this.store.delete(id);
    if (this.store.size) {
      has && localStorage.setItem(this.key, JSON.stringify(Array.from(this.store)));
    } else {
      localStorage.removeItem(this.key);
    }
    return has;
  }
}
export const store = new Store<string>(UPLOADX_KEY);
