const UPLOADX_KEY = 'UPLOADX_V3.0';
class Store<T> {
  private hasStorage = 'localStorage' in window;
  constructor(public key: string) {}
  set(id: string, data: T) {
    this.hasStorage && localStorage.setItem(this.key + id, JSON.stringify(data));
  }
  get(id: string): T | null {
    return this.hasStorage && JSON.parse(localStorage.getItem(this.key + id) || 'null');
  }
  delete(id: string) {
    this.hasStorage && localStorage.removeItem(this.key + id);
  }
}
export const store = new Store<string>(UPLOADX_KEY + '_');
