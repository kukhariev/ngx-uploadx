import { browser, logging } from 'protractor';
import { AppPage } from './app.po';
import { getTestFile } from './testfile';

describe('uploader App', () => {
  let page: AppPage;
  const testFilePath = getTestFile();
  beforeEach(() => {
    page = new AppPage();
  });
  afterEach(async () => {
    page.getButton('Cancel All').click();
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE
      } as logging.Entry)
    );
  });

  it('should upload (directive)', () => {
    page.navigateTo('/directive-way');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (mixed)', async () => {
    page.navigateTo('/service-way');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (service)', async () => {
    page.navigateTo('/service-code-way');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (onPush)', async () => {
    page.navigateTo('/on-push');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (multi-options)', () => {
    page.navigateTo('/multi');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (multi-service)', () => {
    page.navigateTo('/multi2');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });

  it('should upload (tus)', () => {
    page.navigateTo('/tus');
    page.getFileInput().sendKeys(testFilePath);
    expect(page.waitForStatus('complete')).toBeTruthy();
  });
});
