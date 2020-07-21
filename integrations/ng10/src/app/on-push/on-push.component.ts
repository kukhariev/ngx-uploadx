import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import {
  b64,
  RequestOptions,
  Uploader,
  UploaderX,
  UploadState,
  UploadxOptions,
  UploadxService
} from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-on-push',
  templateUrl: './on-push.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushComponent implements OnDestroy {
  state$: Observable<UploadState>;
  uploads$: Observable<Uploader[]>;
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    prerequest: injectDigestHeader,
    token: this.tokenGetter.bind(this)
  };

  constructor(private uploadService: UploadxService, private auth: AuthService) {
    this.uploads$ = this.uploadService.connect(this.options);
    this.state$ = this.uploadService.events;
  }

  ngOnDestroy(): void {
    this.uploadService.disconnect();
  }

  cancelAll(): void {
    this.uploadService.control({ action: 'cancel' });
  }

  pauseAll(): void {
    this.uploadService.control({ action: 'pause' });
  }

  uploadAll(): void {
    this.uploadService.control({ action: 'upload' });
  }

  async tokenGetter(httpStatus?: number): Promise<string> {
    return httpStatus === 401 ? await this.auth.renewToken().toPromise() : this.auth.accessToken;
  }
}

const hasher = {
  isSupported: window.crypto && !!window.crypto.subtle,
  async sha(data: ArrayBuffer): Promise<string> {
    return this.hex(await crypto.subtle.digest('SHA-1', data));
  },
  getDigest(body: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => resolve(await this.sha(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(body);
    });
  },
  hex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

async function injectDigestHeader(this: UploaderX, req: RequestOptions): Promise<RequestOptions> {
  if (hasher.isSupported && req.method === 'PUT' && req.body instanceof Blob) {
    const headers = req.headers || {};
    const sha = await hasher.getDigest(req.body);
    headers.Digest = 'sha=' + b64.encode(sha);
    console.log(sha, headers.Digest);
  }
  return req;
}
