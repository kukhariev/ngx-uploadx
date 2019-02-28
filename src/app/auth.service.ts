import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    localStorage.setItem('token', `token-${new Date().getSeconds()}`);
    setInterval(() => {
      localStorage.setItem('token', `token-${new Date().getSeconds()}`);
    }, 500);
  }
}

export function tokenGetter() {
  return localStorage.getItem('token');
}
