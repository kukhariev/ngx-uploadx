import { InjectionToken } from '@angular/core';
import { UploaderClass, UploaderOptions } from './interfaces';
import { UploaderX } from './uploaderx';

/**
 * Global Module Options
 */
export interface UploadxOptions extends UploaderOptions {
  /**
   * Provide a user-defined class to support another upload protocol or to extend an existing one.
   * @defaultValue UploadX
   */
  uploaderClass?: UploaderClass;
  /**
   * Set the maximum parallel uploads
   * @defaultValue 2
   */
  concurrency?: number;
  /**
   * Automatically start upload when files added
   * @defaultValue true
   */
  autoUpload?: boolean;
  /**
   * File types the user can pick from the file input
   */
  allowedTypes?: string;
  /**
   * Add 'multiple' attribute
   * @defaultValue true
   */
  multiple?: boolean;
}

export interface UploadxFactoryOptions extends UploadxOptions {
  endpoint: string;
  autoUpload: boolean;
  concurrency: number;
  uploaderClass: UploaderClass;
}

const defaultOptions: UploadxFactoryOptions = {
  endpoint: '/upload',
  autoUpload: true,
  concurrency: 2,
  uploaderClass: UploaderX
};

export const UPLOADX_FACTORY_OPTIONS = new InjectionToken<UploadxFactoryOptions>(
  'uploadx.factory.options',
  { providedIn: 'root', factory: () => defaultOptions }
);
export const UPLOADX_OPTIONS = new InjectionToken<UploadxOptions>('uploadx.options');
