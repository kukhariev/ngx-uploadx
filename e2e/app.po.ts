import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(path) {
    return browser.get(path);
  }
  sleep(t) {
    return browser.sleep(t);
  }
  getFileInput() {
    return element(by.css('app-root input'));
  }
  getUploadButton() {
    return element(by.css('app-root upload'));
  }
  getTable() {
    return element(by.css('app-root uploads-table'));
  }
  getPreText() {
    return element(by.css('app-root pre')).getText();
  }
  waitForComplete() {
    browser.wait(
      () =>
        element(by.css('app-root pre'))
          .getText()
          .then(text => text.indexOf('complete') > 0),
      15000
    );
    return 'complete';
  }
}
