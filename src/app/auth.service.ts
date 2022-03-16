import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken = () => `${new Date().getTime()}`;

  getAccessToken(): string {
    return `${new Date().getTime()}`;
  }

  getToken(): Observable<string> {
    return of(`${new Date().getTime()}`).pipe(delay(400));
  }

  async getTokenAsPromise(): Promise<string> {
    return `${new Date().getTime()}`;
  }
}
