import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['e2e/**/*'],
    globals: true,
    environment: 'happy-dom',
    testTimeout: 10000,
    setupFiles: ['./src/test-setup.ts'],
    browser: {
      screenshotFailures: false
    }
  }
});
