import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: () => string = () => {
    console.debug('auth token updated');
    return `${new Date().getTime()}`;
  };

  getAccessToken(): string {
    console.debug('auth token updated');
    return `${new Date().getTime()}`;
  }

  getToken(): Observable<string> {
    return of(`${new Date().getTime()}`).pipe(delay(400));
  }

  getTokenAsPromise(): Promise<string> {
    console.debug('auth token updated');
    return Promise.resolve(`${new Date().getTime()}`);
  }
}
