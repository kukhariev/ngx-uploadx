import { Provider } from '@angular/core';
import { UPLOADX_OPTIONS, UploadxOptions } from './options';

/**
 * Provides configuration options for standalone app.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideUploadx({
 *       endpoint: uploadUrl,
 *       allowedTypes: 'video/*,audio/*',
 *       maxChunkSize: 96 * 1024 * 1024
 *     })
 *   ]
 * });
 * ```
 */
export function provideUploadx(options: UploadxOptions = {}) {
  const providers: Provider[] = [
    {
      provide: UPLOADX_OPTIONS,
      useValue: options
    }
  ];
  return providers;
}
