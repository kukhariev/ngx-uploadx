import { test } from '@playwright/test';

test.describe.serial('app', async () => {
  const inMemoryFile = {
    name: 'file.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('test')
  };

  test.afterEach(async ({ page }) => {
    await page.locator('text=Cancel All').first().click();
  });

  test('completes upload on simple-upload page', async ({ page }) => {
    await page.goto('/simple-upload');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('completes upload on tus-advanced page', async ({ page }) => {
    await page.goto('/tus-advanced');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('completes upload on s3-upload page', async ({ page }) => {
    await page.goto('/s3-upload');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('completes upload on onpush-service page', async ({ page }) => {
    await page.goto('/onpush-service');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('completes multi-file upload on multi-files-directive page', async ({ page }) => {
    await page.goto('/multi-files-directive');

    await page.locator('input[type="file"]').first().setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('completes upload in multi-instances demo', async ({ page }) => {
    await page.goto('/multi-instances');

    await page.locator('input[type="file"]').first().setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });

  test('should upload (tus)', async ({ page }) => {
    await page.goto('/tus');

    await page.locator('input[type="file"]').setInputFiles(inMemoryFile);
    await page.waitForSelector('span:has-text("complete")', { timeout: 3000 });
  });
});
