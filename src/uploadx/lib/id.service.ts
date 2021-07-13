import { Injectable } from '@angular/core';
import { Uploader } from './uploader';
import { createHash } from './utils';

export interface UidService {
  generateId(uploader: Uploader): Promise<string> | string;
}

@Injectable({
  providedIn: 'root'
})
export class IdService implements UidService {
  generateId(uploader: Uploader): Promise<string> | string {
    const print = JSON.stringify({
      ...uploader.metadata,
      type: uploader.constructor.name,
      endpoint: uploader.endpoint
    });
    return createHash(uploader.name + uploader.size).toString(16) + createHash(print).toString(16);
  }
}
