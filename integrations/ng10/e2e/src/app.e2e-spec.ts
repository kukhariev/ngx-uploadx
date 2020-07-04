import { browser, logging } from 'protractor';
import { AppPage } from './app.po';

describe('Angular v10 test', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should have input type=file', () => {
    page.navigateTo();
    expect(page.getFileInput().isPresent()).toBe(true);
  });
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE
      } as logging.Entry)
    );
  });
});
