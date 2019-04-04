import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    localStorage.setItem('token', `token-${new Date().getSeconds()}`);
  }
  refresh() {
    const token = `token-${new Date().getSeconds()}`;
    localStorage.setItem('token', token);
    return of(token).pipe(delay(100));
  }
}

export function tokenGetter() {
  // return localStorage.getItem('token');
  return `token-${new Date().getSeconds()}`;
}
