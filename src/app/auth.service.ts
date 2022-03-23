import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Ajax, AjaxRequestConfig, UPLOADX_AJAX } from 'ngx-uploadx';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(@Inject(UPLOADX_AJAX) private ajax: Ajax) {}

  accessToken = () => {
    console.info('auth token updated');
    return this.request<TokenResponse>({ url: `${environment.api}/auth`, method: 'POST' }).then(
      r => r?.access_token
    );
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

  private request<T>(config: AjaxRequestConfig): Promise<T> {
    return this.ajax.request(config).then(r => JSON.parse(r.data));
  }
}
