import { Component, OnDestroy } from '@angular/core';
import { Tus, UploadState, UploadxControlEvent, UploadxOptions } from 'ngx-uploadx';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Ufile } from '../ufile';

@Component({
  selector: 'app-tus',
  templateUrl: './tus.component.html'
})
export class TusComponent implements OnDestroy {
  control: UploadxControlEvent;
  state$: Observable<UploadState>;
  uploads: Ufile[] = [];

  options: UploadxOptions = {
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/files?uploadType=tus`,
    // endpoint: `https://master.tus.io/files/`,
    uploaderClass: Tus,
    chunkSize: 0
  };
  private unsubscribe$ = new Subject();

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel(id?: string): void {
    this.control = { action: 'cancel', uploadId: id };
  }

  pause(id?: string): void {
    this.control = { action: 'pause', uploadId: id };
  }

  upload(id?: string): void {
    this.control = { action: 'upload', uploadId: id };
  }

  onUpload(events$: Observable<UploadState>): void {
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
