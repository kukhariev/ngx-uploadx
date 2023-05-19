import { Provider } from '@angular/core';
import { UPLOADX_OPTIONS, UploadxOptions } from './options';

export function provideUploadx(options: UploadxOptions = {}) {
  const providers: Provider[] = [
    {
      provide: UPLOADX_OPTIONS,
      useValue: options
    }
  ];
  return providers;
}
