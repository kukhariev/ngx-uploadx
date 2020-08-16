import { browser, by, element, ElementFinder } from 'protractor';

export class AppPage {
  navigateTo(path: string): Promise<unknown> {
    return browser.get(path) as Promise<unknown>;
  }
  getFileInput(): ElementFinder {
    return element(by.css('app-root input'));
  }
  getVideoFileInput(): ElementFinder {
    return element(by.css('app-root #videos'));
  }
  getTable(): ElementFinder {
    return element(by.css('app-root .uploads-table'));
  }
  getPreText(): Promise<string> {
    return element(by.css('app-root pre')).getText() as Promise<string>;
  }
  waitForCompleteTable(): string {
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
