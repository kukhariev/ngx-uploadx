import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken = `${new Date().getTime()}`;

  getToken(): Observable<string> {
    this.accessToken = `${new Date().getTime()}`;
    localStorage.setItem('token', this.accessToken);
    return of(this.accessToken).pipe(delay(400));
  }

  getTokenAsPromise(): Promise<string> {
    return this.getToken().toPromise();
  }
}
