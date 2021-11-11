import { UploadStatus } from 'ngx-uploadx';
import { browser, by, element, ElementFinder } from 'protractor';
import * as remote from 'selenium-webdriver/remote';

export class AppPage {
  navigateTo(path: string): Promise<unknown> {
    return browser.get(path) as Promise<unknown>;
  }

  getFileInput(): ElementFinder {
    browser.setFileDetector(new remote.FileDetector());
    return element.all(by.css('app-root input')).first();
  }

  getTable(): ElementFinder {
    return element(by.css('app-root .uploads-table'));
  }

  getButton(text: string): ElementFinder {
    return element.all(by.buttonText(text)).first();
  }

  getPreText(): Promise<string> {
    return element(by.css('app-root pre')).getText() as Promise<string>;
  }

  async waitForStatus(status: UploadStatus): Promise<boolean> {
    try {
      await browser.wait(
        () =>
          element(by.css('.uploads-table'))
            .getText()
            .then(text => text.indexOf(status) >= 0),
        30000
      );
    } catch (e) {
      return false;
    }
    return true;
  }
}
