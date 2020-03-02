/* tslint: disable */
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
  });

  it('should have input type=file', () => {
    page.navigateTo('/directive-way');
    expect(page.getFileInput().isPresent()).toBe(true);
  });

  it('should have table', () => {
    expect(page.getTable().isPresent()).toBe(true);
    expect(page.getPreText()).toEqual('null');
  });

  it('should upload (Directive)', () => {
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (Mixed)', async () => {
    page.navigateTo('/service-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (Service)', async () => {
    page.navigateTo('/service-code-way');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (onPush)', async () => {
    page.navigateTo('/on-push');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });

  it('should upload (Multi)', () => {
    page.navigateTo('/multi');
    page.getVideoFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });
  it('should upload (Tus)', () => {
    page.navigateTo('/tus');
    page.getFileInput().sendKeys(absolutePath);
    expect(page.waitForCompleteTable()).toEqual('complete');
  });
});
