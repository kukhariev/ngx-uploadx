import { test } from '@playwright/test';

test.describe('app', async () => {
  const inMemoryFile = {
    name: 'file.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('test')
  };

  test.afterEach(async ({ page }) => {
    await page.locator('text=Cancel All').first().click();
  });

  test('should upload (directive)', async ({ page }) => {
    await page.goto('/');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (mixed)', async ({ page }) => {
    await page.goto('/service-way');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (service)', async ({ page }) => {
    await page.goto('/service-code-way');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (on-push)', async ({ page }) => {
    await page.goto('/on-push');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (multi)', async ({ page }) => {
    await page.goto('/multi');

    await page.locator('input[type="file"]').first().setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (multi2)', async ({ page }) => {
    await page.goto('/multi2');

    await page.locator('input[type="file"]').first().setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (tus)', async ({ page }) => {
    await page.goto('/tus');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });
});
