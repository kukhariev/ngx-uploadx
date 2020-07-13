import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: string;

  constructor() {
    this.accessToken = `token-${new Date().getTime()}`;
  }

  renewToken(): Observable<string> {
    this.accessToken = `token-${new Date().getTime()}`;
    return of(this.accessToken).pipe(delay(400));
  }
}
