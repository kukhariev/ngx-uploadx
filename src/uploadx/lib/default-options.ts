import { InjectionToken } from '@angular/core';
import { UploaderClass } from './interfaces';
import { UploaderX } from './uploaderx';

export interface UploadxDefaultOptions {
  endpoint: string;
  autoUpload: boolean;
  concurrency: number;
  uploaderClass: UploaderClass;
}

const defaultOptions: UploadxDefaultOptions = {
  endpoint: '/upload',
  autoUpload: true,
  concurrency: 2,
  uploaderClass: UploaderX
};

export const UPLOADX_DEFAULT_OPTIONS = new InjectionToken<UploadxDefaultOptions>(
  'uploadx.default.options',
  { providedIn: 'root', factory: () => defaultOptions }
);
