import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: () => string = () => {
    console.info('auth token updated');
    return `${new Date().getTime()}`;
  };

  getAccessToken(): string {
    console.info('auth token updated');
    return `${new Date().getTime()}`;
  }

  getToken(): Observable<string> {
    return of(`${new Date().getTime()}`).pipe(delay(400));
  }

  getTokenAsPromise(): Promise<string> {
    console.info('auth token updated');
    return Promise.resolve(`${new Date().getTime()}`);
  }
}
