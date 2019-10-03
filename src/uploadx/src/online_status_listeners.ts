export class OnlineStatusListeners {
  constructor(private online: () => any, private offline: () => any) {
    window.addEventListener('online', this.online);
    window.addEventListener('offline', this.offline);
  }
  unregister() {
    window.removeEventListener('online', this.online);
    window.removeEventListener('offline', this.offline);
  }
}
