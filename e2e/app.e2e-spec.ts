/* tslint: disable */
import { browser, logging } from 'protractor';
import { AppPage } from './app.po';
const absolutePath = require('path').resolve('./e2e/test.mp4');
const { reset } = require('../server');

describe('uploader App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });
  afterEach(async () => {
    await reset();
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE
      } as logging.Entry)
    );
  });

  it('should have input type=file', () => {
    page.navigateTo('/directive-way');
    expect(page.getFileInput().isPresent()).toBe(true);
  });

  it('should have table', () => {
    expect(page.getTable().isPresent()).toBe(true);
    expect(page.getPreText()).toEqual('null');
  });

  it('should upload (directive)', () => {
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (mixed)', async () => {
    page.navigateTo('/service-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (service)', async () => {
    page.navigateTo('/service-code-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (onPush)', async () => {
    page.navigateTo('/on-push');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (multi-options)', () => {
    page.navigateTo('/multi');
    page.getVideoFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (multi-service)', () => {
    page.navigateTo('/multi2');
    page.getVideoFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (tus)', () => {
    page.navigateTo('/tus');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });
});
