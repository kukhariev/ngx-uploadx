import { Component, OnDestroy } from '@angular/core';
import { UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-directive-way',
  templateUrl: './directive-way.component.html'
})
export class DirectiveWayComponent implements OnDestroy {
  control: UploadxControlEvent;
  state$: Observable<UploadState>;
  uploads: Ufile[] = [];
  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=uploadx`,
    token: 'token'
  };
  private unsubscribe$ = new Subject();
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  cancel(id?: string) {
    this.control = { action: 'cancel', uploadId: id };
  }
  pause(id?: string) {
    this.control = { action: 'pause', uploadId: id };
  }
  upload(id?: string) {
    this.control = { action: 'upload', uploadId: id };
  }
  onUpload(events$: Observable<UploadState>) {
    this.state$ = events$;
    events$.pipe(takeUntil(this.unsubscribe$)).subscribe((evt: UploadState) => {
      const target = this.uploads.find(f => f.uploadId === evt.uploadId);
      if (target) {
        target.progress = evt.progress;
        target.status = evt.status;
      } else {
        this.uploads.push(new Ufile(evt));
      }
    });
  }
}
