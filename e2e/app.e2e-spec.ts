/* tslint: disable */
import { AppPage } from './app.po';
const absolutePath = require('path').resolve('./e2e/test.mp4');
const { reset } = require('../server');

describe('uploader App', () => {
  let page: AppPage;
  page = new AppPage();
  afterEach(() => {
    // page.sleep(5000);
    reset();
  });
  it('should have input type=file', () => {
    page.navigateTo('/directive-way');
    expect(page.getFileInput().isPresent()).toBe(true);
  });
  it('should have table', () => {
    expect(page.getTable().isPresent()).toBe(true);
    expect(page.getPreText()).toEqual('null');
  });

  it('should upload a file (Directive)', () => {
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });

  it('should upload a file (Mixed)', async () => {
    page.navigateTo('/service-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });

  it('should upload a file (Service)', async () => {
    page.navigateTo('/service-code-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForComplete()).toEqual('complete');
  });

  it('should upload a file (onPush)', async () => {
    page.navigateTo('/on-push');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload a file (Multi)', () => {
    page.navigateTo('/multi');
    page.getVideoFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });
  it('should upload a file (Tus)', () => {
    page.navigateTo('/tus');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });
});
