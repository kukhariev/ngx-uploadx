import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideUploadx } from 'ngx-uploadx';
import { appRoutes } from './app.routes';
import { serverUrl } from './config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideUploadx({
      allowedTypes: 'image/*,video/*',
      endpoint: `${serverUrl}/files?uploadType=uploadx`,
      headers: { 'ngsw-bypass': 'true' },
      retryConfig: { maxAttempts: 5 }
    })
  ]
};
