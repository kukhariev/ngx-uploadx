import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(path: string) {
    return browser.get(path);
  }
  getFileInput() {
    return element(by.css('app-root input'));
  }
  getVideoFileInput() {
    return element(by.css('app-root  .video'));
  }
  getTable() {
    return element(by.css('app-root .uploads-table'));
  }
  getPreText() {
    return element(by.css('app-root pre')).getText();
  }
  waitForCompleteTable() {
    browser.wait(
      () =>
        element(by.css('.uploads-table'))
          .getText()
          .then(text => text.indexOf('complete') >= 0),
      15000
    );
    return 'complete';
  }
}
