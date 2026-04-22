# ngx-uploadx

> Angular Resumable Upload Module

[![tests][tests-image]][tests-url]
[![build][build-image]][build-url]
[![npm version][npm-image]][npm-url]
[![commits since latest release][comm-image]][comm-url]
[![License: MIT][license-image]][license-url]
[![Angular](https://img.shields.io/badge/Angular-18.0+-blue.svg)](https://angular.io)

## ✨ Key Features

- Pause / Resume / Cancel uploads
- Automatic retries with exponential backoff
- Chunked uploads with adaptive chunk size
- Real-time progress, speed & ETA tracking
- Custom headers, metadata, authorization
- Drag & drop support via `uploadxDrop` directive

## ⚡ Quick Start

- Add ngx-uploadx module as dependency:

```sh
  npm install ngx-uploadx
```

- Add `uploadx` directive to the component template and provide the required options:

```ts
// Standalone component code
//...
import { UploadxDirective, UploadxOptions, UploadState } from 'ngx-uploadx';

@Component({
  selector: 'upload-component',
  template: ` <input type="file" [uploadx]="options" (state)="onUpload($event)" /> `,
  imports: [UploadxDirective]
})
export class UploadComponent {
  options: UploadxOptions = { endpoint: 'http://localhost:3000/upload' };
  onUpload(state: UploadState) {
    console.log(state);
    //...
  }
}
```

> _Please navigate to the [src/app sub-folder](src/app) for more detailed examples._

## 🖥️ Server-side setup

```sh
  npm install @uploadx/core express
```

```js
import { uploadx } from '@uploadx/core';
import express from 'express';

const app = express();

app.use(
  '/upload',
  uploadx({
    directory: './uploads',
    maxUploadSize: '20GB',
    onComplete: file => {
      console.log('File upload complete: ', file);
      return file;
    }
  })
);

app.listen(3002);
```

🔗 [Full server setup guide →](https://github.com/kukhariev/node-uploadx#readme)

## 📘 API Reference

**Contents:**

- [UploadxOptions](#uploadxoptions)
- [provideUploadx](#provideuploadx)
- [UploadxModule](#uploadxmodule)
- [Directives](#directives)
  - [uploadx](#uploadx)
  - [uploadxDrop](#uploadxdrop)
- [UploadxService](#uploadxservice)
- [UploadState](#uploadstate)
- [UploadxControlEvent](#uploadxcontrolevent)
- [DI tokens](#di-tokens)

### UploadxOptions

- `allowedTypes` Allowed file types (directive only)

- `authorize` Replaces the default Bearer authorization logic[(example)](src/app/onpush-service/onpush-service.component.ts)

- `autoUpload` Auto start upload when files added. Default value: `true`

- `storeIncompleteHours` Limit upload lifetime. Default value: `24`

- `chunkSize` Fixed chunk size. If not specified, the optimal size will be automatically adjusted based on the network speed.
  If set to `0`, normal uploading will be used instead of chunked

- `maxChunkSize` Dynamic chunk size limit

- `concurrency` Set the maximum parallel uploads. Default value: `2`

- `endpoint` URL to create new uploads. Default value: `'/upload'`

- `responseType` Expected server response type

- `headers` Headers to be appended to each HTTP request

- `metadata` Custom metadata to be added to the uploaded files

- `multiple` Allow selecting multiple files. Default value: `true` (directive only)

- `prerequest` Function called before every request [(example)](src/app/uploadx-advanced/uploadx-advanced.component.ts)

- `retryConfig` Object to configure retry settings:

  - `maxAttempts` Maximum number of retry attempts. Default value: `8`
  - `shouldRestartCodes` Upload not exist and will be restarted. Default value: `[404, 410]`
  - `authErrorCodes` If one of these codes is received, the request will be repeated with an updated authorization token. Default value: `[401]`
  - `shouldRetryCodes` Retryable 4xx status codes. Default value: `[408, 423, 429, 460]`
  - `shouldRetry` Overrides the built-in function that determines whether the operation should be retried
  - `minDelay` Minimum (initial) retry interval. Default value: `500`
  - `maxDelay` Maximum retry interval. Default value: `50_000`
  - `onBusyDelay` Delay used between retries for non-error responses with missing range/offset. Default value: `1000`
  - `timeout` Time interval after which unfinished requests must be retried
  - `keepPartial` Determines whether partial chunks should be kept

- `token` Authorization token as a `string` or function returning a `string` or `Promise<string>`

- `uploaderClass` Upload API implementation. Built-in: `UploaderX`(default), `Tus`. More [examples](uploader-examples)

### provideUploadx

Provides configuration options for standalone app [(example)](src/app/app.config.ts).

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideUploadx({
      endpoint: 'http://example.com/upload',
      allowedTypes: 'video/*,audio/*',
      maxChunkSize: 96 * 1024 * 1024
    })
  ]
});
```

### UploadxModule

Adds directives and provide static method `withConfig` for global configuration

```ts
@NgModule({
  declarations: [AppComponent, UploadComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    UploadxModule.withConfig({
      allowedTypes: 'image/*,video/*',
      endpoint: `${serverUrl}/files?uploadType=uploadx`,
      headers: { 'ngsw-bypass': 'true' },
      retryConfig: { maxAttempts: 5 }
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
```

> :bulb: _No need to import `UploadxModule` if you do not use the `uploadx` or `uploadxDrop` directives in your application._

### Directives

```html
<div uploadxDrop>
  <label class="file-drop">
    <input type="file" [uploadx]="options" [control]="control" (state)="onState($event)" />
  </label>
</div>
```

#### uploadx

File input directive.

selectors: `[uploadx]`, `uploadx`

Properties:

- `@Input() uploadx: UploadxOptions` Set directive options

- `@Input() options: UploadxOptions` Alias for `uploadx` property

- `@Input() control: UploadxControlEvent` Control the uploads

- `@Output() state: EventEmitter<UploadState>` Event emitted on upload state change

#### uploadxDrop

File drop directive.

selector: `uploadxDrop`

> :bulb: _Activates the `.uploadx-drop-active` class on DnD operations._

### UploadxService

Programmatic API for upload management. Use it when you need direct control over uploads from component code, dynamic configuration, or deep integration with application state.

- `init(options?: UploadxOptions): Observable<UploadState>`

  Initializes service. Returns Observable that emits a new value on progress or status changes.

  ```ts
  // @example:
  uploadxOptions: UploadxOptions = {
    concurrency: 4,
    endpoint: `${environment.api}/upload`,
    uploaderClass: Tus
  };
  ngOnInit() {
    this.uploadService.init(this.uploadxOptions)
      .subscribe((state: UploadState) => {
        console.log(state);
        // ...
      }
  }
  ```

- `connect(options?: UploadxOptions): Observable<Uploader[]>`

  Initializes service. Returns Observable that emits the current queue.

  ```ts
  // @example:
  @Component({
    template: `
      <input type="file" uploadx">
      <div *ngFor="let item of uploads$ | async">{{item.name}}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class UploadsComponent {
    uploads$: Observable<Uploader[]>;
    options: UploadxOptions = {
      endpoint: `${environment.api}/upload?uploadType=uploadx`,
      headers: { 'ngsw-bypass': 1 }
    }
    constructor(private uploadService: UploadxService) {
      this.uploads$ = this.uploadService.connect(this.options);
    }
  ```

- `disconnect(): void`

  Terminate all uploads and clears the queue.

- `ngOnDestroy(): void`

  Called when the service instance is destroyed. Interrupts all uploads and clears the queue and subscriptions.

  > :bulb: _Normally `ngOnDestroy()` is never called because `UploadxService` is an application-wide service,
  > and uploading will continue even after the upload component is destroyed._

- `handleFiles(files: FileList | File | File[], options = {} as UploadxOptions): void`

  ```ts
  // @example:
  onFilesSelected(): void {
    this.uploadService.handleFiles(this.fileInput.nativeElement.files);
  }
  ```

  Creates uploaders for files and adds them to the upload queue.

- `control(event: UploadxControlEvent): void`

  Uploads control. Available actions: `upload`, `cancel`, `pause`, `update`.

  ```ts
  // @example:
  pause(uploadId?: string) {
    this.uploadService.control({ action: 'pause', uploadId });
  }
  setToken(token: string) {
    this.uploadService.control({ token });
  }
  ```

- `request<T = string>(config: AjaxRequestConfig): Promise<AjaxResponse<T>>`

  Make HTTP request with `axios` like interface.

  ```ts
  // @example:
  import { AjaxRequestConfig, UploadxService } from 'ngx-uploadx';

  class MyService {
    constructor(private uploadService: UploadxService) {}

    async fetchUploads() {
      const config: AjaxRequestConfig = {
        url: '/api/uploads',
        method: 'GET'
      };
      const response = await this.uploadService.request(config);
      return response.items;
    }
  }
  ```

- `state(): UploadState[]`

  Returns the current state of uploads.

  ```ts
  // @example:
  uploads: UploadState[];
  constructor(private uploadService: UploadxService) {
    // restore background uploads
    this.uploads = this.uploadService.state();
  }
  ```

- `queue: Uploader[]`

  Uploaders array.

  ```ts
  // @example:
  export class UploadComponent {
    state: UploadState;
    options: UploadxOptions = {
      concurrency: 1,
      multiple: false,
      endpoint: `${environment.api}/upload`,
    }
    constructor(private uploadService: UploadxService) {
      this.state = this.uploadService.queue[0] || {};
    }
  ```

- `events: Observable<UploadState>`

  Uploads state events.

### UploadState

Upload state object emitted by the service:

```ts
interface UploadState {
  readonly file: File; // Uploaded file
  readonly name: string; // Original file name
  readonly progress: number; // Progress percentage
  readonly remaining: number; // Estimated remaining time
  readonly response: ResponseBody; // HTTP response body
  readonly responseStatus: number; // HTTP response status code
  readonly responseHeaders: Record<string, string>; // HTTP response headers
  readonly size: number; // File size in bytes
  readonly speed: number; // Upload speed bytes/sec
  readonly status: UploadStatus; // Upload status
  readonly uploadId: string; // Unique upload id
  readonly url: string; // File url
}

type UploadStatus =
  | 'added'
  | 'queue'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'retry'
  | 'updated';
```

### UploadxControlEvent

Control event type for `uploadService.control()`:

```ts
interface UploadxControlEvent {
  action?: 'upload' | 'cancel' | 'pause' | 'update';
  uploadId?: string; // Target upload ID (optional - affects all if not provided)
  endpoint?: string; // URL to create new uploads
  headers?: RequestHeaders; // Headers to be appended
  metadata?: Metadata; // Custom uploads metadata
  token?: string; // Authorization token
}
```

### DI tokens

- `UPLOADX_FACTORY_OPTIONS`: override default configuration

- `UPLOADX_OPTIONS`: global options

- `UPLOADX_AJAX`: override internal ajax lib

## 🧪 Demo

Checkout the [Demo App](https://ngx-uploadx.vercel.app/) or run it on your local machine:

- Run script `npm start`
- Navigate to `http://localhost:4200/`

## 🛠️ Build

Run `npm run build:pkg` to build the lib.

> _packaged by_ [ng-packagr](https://github.com/dherges/ng-packagr)

## 🐞 Bugs and Feedback

For bugs, questions and discussions please use the [GitHub Issues](https://github.com/kukhariev/ngx-uploadx/issues).

## 🤝 Contributing

Pull requests are welcome!\
To contribute, please read [contributing instructions](https://github.com/kukhariev/ngx-uploadx/blob/master/.github/CONTRIBUTING.md#contributing).

## 📄 License

The MIT License (see the [LICENSE](LICENSE) file for the full text)

[npm-image]: https://img.shields.io/npm/v/ngx-uploadx.svg
[npm-url]: https://www.npmjs.com/package/ngx-uploadx
[tests-image]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/test.yml/badge.svg
[tests-url]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/test.yml
[build-image]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/integration.yml/badge.svg
[build-url]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/integration.yml
[comm-image]: https://img.shields.io/github/commits-since/kukhariev/ngx-uploadx/latest
[comm-url]: https://github.com/kukhariev/ngx-uploadx/releases/latest
[license-image]: https://img.shields.io/badge/License-MIT-green.svg
[license-url]: https://github.com/kukhariev/ngx-uploadx/blob/master/LICENSE
