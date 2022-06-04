/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from './store';

describe('Store', () => {
  let store: Store;
  let _ls: { [x: string]: string };
  beforeEach(() => {
    _ls = {};
    spyOn(localStorage, 'getItem').and.callFake(key => (key in _ls ? _ls[key] : null));
    spyOn(localStorage, 'setItem').and.callFake((key, value) => (_ls[key] = value + ''));
    spyOn(localStorage, 'removeItem').and.callFake(key => (_ls[key] = null as never));
    spyOn(localStorage, 'clear').and.callFake(() => (_ls = {}));
    store = new Store();
    spyOn(<any>store, 'keys').and.callFake(() => Object.keys(_ls));
  });

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
