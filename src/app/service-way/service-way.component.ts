import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadState, UploadxOptions, UploadxService } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-service-way',
  templateUrl: './service-way.component.html'
})
export class ServiceWayComponent implements OnDestroy, OnInit {
  state$!: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: () => this.auth.accessToken,
    chunkSize: 2_097_152
  };
  private unsubscribe$ = new Subject();

  constructor(private uploadxService: UploadxService, private auth: AuthService) {}

  ngOnInit(): void {
    this.state$ = this.uploadxService.init(this.options);
    this.state$.pipe(takeUntil(this.unsubscribe$)).subscribe((state: UploadState) => {
      if (state.status === 'retry' && state.responseStatus === 401) {
        this.auth.renewToken().subscribe(token => console.log('new accessToken: ', token));
      }
      const file = this.uploads.find(item => item.uploadId === state.uploadId);
      file ? file.update(state) : this.uploads.push(new Ufile(state));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel(uploadId?: string): void {
    this.uploadxService.control({ action: 'cancel', uploadId });
  }

  pause(uploadId?: string): void {
    this.uploadxService.control({ action: 'pause', uploadId });
  }

  upload(uploadId?: string): void {
    this.uploadxService.control({ action: 'upload', uploadId });
  }
}
