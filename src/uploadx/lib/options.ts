import { InjectionToken } from '@angular/core';
import { Ajax } from './ajax';
import { AuthorizeRequest, UploaderOptions } from './interfaces';
import { Uploader } from './uploader';
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
  /**
   * Retention time for incomplete uploads
   * @defaultValue 24
   */
  storeIncompleteHours?: number;
}

export interface UploadxFactoryOptions extends UploadxOptions {
  endpoint: string;
  autoUpload: boolean;
  concurrency: number;
  uploaderClass: UploaderClass;
  authorize: AuthorizeRequest;
  storeIncompleteHours: number;
}

export type UploaderClass = new (
  file: File,
  options: UploaderOptions,
  stateChange: (uploader: Uploader) => void,
  ajax: Ajax
) => Uploader;

const defaultOptions: UploadxFactoryOptions = {
  endpoint: '/upload',
  autoUpload: true,
  concurrency: 2,
  uploaderClass: UploaderX,
  authorize: (req, token) => {
    token && (req.headers['Authorization'] = `Bearer ${token}`);
    return req;
  },
  storeIncompleteHours: 24
};

export const UPLOADX_FACTORY_OPTIONS = new InjectionToken<UploadxFactoryOptions>(
  'uploadx.factory.options',
  { providedIn: 'root', factory: () => defaultOptions }
);
export const UPLOADX_OPTIONS = new InjectionToken<UploadxOptions>('uploadx.options');
