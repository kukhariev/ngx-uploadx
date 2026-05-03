/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from './store';

describe('Store', () => {
  const store = new Store();

  it('set/get/delete', () => {
    store.set('key', 'value');
    expect(store.get('key')).toBe('value');
    store.delete('key');
    expect(store.get('key')).toBeNull();
  });

  it('clear', () => {
    store.set('key', 'value');
    store.clear(10);
    expect(store.get('key')).toBe('value');
    store.clear();
    expect(store.get('key')).toBeNull();
  });
});
