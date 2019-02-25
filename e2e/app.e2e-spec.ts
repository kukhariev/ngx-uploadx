import { AppPage } from './app.po';
const absolutePath = require('path').resolve('./e2e/test.mp4');

describe('uploader App', () => {
  let page: AppPage;
  page = new AppPage();

  it('should have input type=file', () => {
    page.navigateTo('/directive-way');
    expect(page.getFileInput()).toBeTruthy();
  });
  it('should have table', () => {
    expect(page.getTable()).toBeTruthy();
    expect(page.getPreText()).toEqual('null');
  });
  it('should upload a file (Directive)', () => {
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });

  it('should upload a file (Mixed)', () => {
    page.navigateTo('/service-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });

  it('should upload a file (Service)', () => {
    page.navigateTo('/service-code-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });
});
