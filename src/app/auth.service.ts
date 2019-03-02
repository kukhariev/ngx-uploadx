import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    localStorage.setItem('token', `token-${new Date().getSeconds()}`);
  }
}

export function tokenGetter() {
  // return localStorage.getItem('token');
  return `token-${new Date().getSeconds()}`;
}
