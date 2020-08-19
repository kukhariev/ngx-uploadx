import { browser, by, element, ElementFinder } from 'protractor';
import { UploadStatus } from '../src/uploadx';

export class AppPage {
  navigateTo(path: string): Promise<unknown> {
    return browser.get(path) as Promise<unknown>;
  }

  getFileInput(): ElementFinder {
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
        15000
      );
    } catch (e) {
      return false;
    }
    return true;
  }
}
