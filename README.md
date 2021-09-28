# ngx-uploadx

> Angular Resumable Upload Module

[![npm version][npm-image]][npm-url]
[![commits since latest release][comm-image]][comm-url]

[![tests][tests-image]][tests-url]
[![build][build-image]][build-url]
[![browserstack][browserstack-image]][browserstack-url]

## Key Features

- Pause / Resume / Cancel Uploads
- Retries using exponential back-off strategy
- Chunking

## Basic usage

- Add ngx-uploadx module as dependency:

```sh
  npm install ngx-uploadx
```

- Import UploadxModule:

```ts
//...
import { UploadxModule } from 'ngx-uploadx';

@NgModule({
  imports: [
    UploadxModule,
   // ...
});
```

- Add `uploadx` directive to the component template and provide the required options:

```ts
// Component code
//...
import { UploadxOptions, UploadState } from 'ngx-uploadx';

@Component({
  selector: 'app-home',
  templateUrl: `
  <input type="file" [uploadx]="options" (state)="onUpload($event)">
  `
})
export class AppHomeComponent {
  options: UploadxOptions = { endpoint: `[URL]` };
  onUpload(state: UploadState) {
    console.log(state);
    //...
  }
}
```

> _Please navigate to the [src/app sub-folder](src/app) for more detailed examples_

## Server-side setup

- [node-uploadx](https://github.com/kukhariev/node-uploadx)
- [tus-node-server](https://github.com/tus/tus-node-server)
- [tusd](https://github.com/tus/tusd)

## API

### UploadxOptions

- `allowedTypes` Allowed file types (directive only)

- `authorize` Function used to authorize requests [(example)](src/app/on-push/on-push.component.ts)

- `autoUpload` Auto start upload when files added. Default value: `true`

- `storeIncompleteUploadUrl` Keep an incomplete upload URL to allow resuming after browser restart. Default value: `true`

- `storeIncompleteHours` Limit upload lifetime. Default value: `24`

- `chunkSize` Fixed chunk size. If not specified, the optimal size will be automatically adjusted based on the network speed.
  If set to `0`, normal unloading will be used instead of chunked.

- `maxChunkSize` Dynamic chunk size limit

- `concurrency` Set the maximum parallel uploads. Default value: `2`

- `endpoint` URL to create new uploads. Default value: `'/upload'`

- `headers` Headers to be appended to each HTTP request

- `metadata` Custom metadata to be added to the uploaded files

- `multiple` Allow selecting multiple files. Default value: `true` (directive only)

- `prerequest` Function called before every request [(example)](src/app/service-way/service-way.component.ts)

- `retryConfig` Object to configure retry settings:

  - `maxAttempts` Maximum number of retry attempts. Default value: `8`
  - `shouldRestartCodes` Upload not exist and will be restarted. Default value: `[404, 410]`
  - `authErrorCodes` If one of these codes is received, the request will be repeated with an updated authorization token . Default value: `[401]`
  - `shouldRetryCodes` Retryable 4xx status codes. Default value: `[423, 429]`
  - `shouldRetry` Overrides the built-in function that determines whether the operation should be retried
  - `minDelay` Minimum (initial) retry interval. Default value: `500`
  - `maxDelay` Maximum retry interval. Default value: `50_000`
  - `onBusyDelay` Delay used between retries for non-error responses with missing range/offset
  - `timeout` Time interval after which unfinished requests must be retried

- `token` Authorization token as a `string` or function returning a `string` or `Promise<string>`

- `uploaderClass` Upload API implementation. Built-in: `UploaderX`(default), `Tus`. More [examples](uploader-examples).

### UploadxModule

Adds directives and provide static method `withConfig` for global configuration [(example)](src/app/app.module.ts)

### Directives

```html
<div uploadxDrop>
  <label class="file-drop">
    <input type="file" [uploadx]="options" [control]="control" (state)="onState($event)" />
  </label>
</div>
```

#### uploadx

File input directive

selectors: `[uploadx]`, `uploadx`

Properties:

- `@Input() uploadx: UploadxOptions` Set directive options

- `@Input() options: UploadxOptions` Alias for `uploadx` property

- `@Input() control: UploadxControlEvent` Control the uploads

- `@Output() state: EventEmitter<UploadState>` Event emitted on upload state change

#### uploadxDrop

File drop directive.

selector: `uploadxDrop`

_Activates the `.uploadx-drop-active` class on DnD operations._

### UploadxService

- `init(options?: UploadxOptions): Observable<UploadState>`

  Initializes service. Returns Observable that emits a new value on progress or status changes.

  ```ts
  //  @example:
  uploadxOptions: UploadxOptions = {
    concurrency: 4,
    endpoint: `${environment.api}/upload`,
    uploaderClass: Tus
  };
  ngOnInit() {
    this.uploadService.init(this.uploadxOptions)
      .subscribe((item: UploadState) => {
        console.log(item);
        // ...
      }
  }
  ```

- `connect(options?: UploadxOptions): Observable<Uploader[]>`

  Initializes service. Returns Observable that emits the current queue

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

  Terminate all uploads and clears the queue

- `handleFiles(files: FileList | File | File[], options = {} as UploadxOptions): void`

  Creates uploaders for files and adds them to the upload queue

- `control(event: UploadxControlEvent): void`

  Uploads control

  ```ts
  // @example:
  pause(uploadId: string) {
    this.uploadService.control({ action: 'pause', uploadId });
  }
  setToken(token: string) {
    this.uploadService.control({ token });
  }
  ```

- `request<T = string>(config: AjaxRequestConfig): Promise<AjaxResponse<T>>`

  Make HTTP request with `axios` like interface.

- `queue: Uploader[]`

  Uploaders array

- `events: Observable<UploadState>`

  Uploads state events

### DI tokens

- `UPLOADX_FACTORY_OPTIONS` for override default configuration

- `UPLOADX_OPTIONS` for global options

- `UPLOADX_AJAX` for override internal ajax lib

## Run demo

- Run script `npm start`
- Navigate to `http://localhost:4200/`

## Build

Run `npm run build` to build the lib.

> _packaged by_ [ng-packagr](https://github.com/dherges/ng-packagr)

## Contributing

Pull requests are welcome!

## References

- [https://developers.google.com/drive/api/v3/manage-uploads#resumable](https://developers.google.com/drive/api/v3/manage-uploads#resumable)
- [https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md](https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md)

## License

The MIT License (see the [LICENSE](LICENSE) file for the full text)

[npm-image]: https://img.shields.io/npm/v/ngx-uploadx.svg
[npm-url]: https://www.npmjs.com/package/ngx-uploadx
[tests-image]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/test.yml/badge.svg
[tests-url]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/test.yml
[build-image]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/integration.yml/badge.svg
[build-url]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/integration.yml
[browserstack-image]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/browserstack.yml/badge.svg
[browserstack-url]: https://github.com/kukhariev/ngx-uploadx/actions/workflows/browserstack.yml
[comm-image]: https://img.shields.io/github/commits-since/kukhariev/ngx-uploadx/latest
[comm-url]: https://github.com/kukhariev/ngx-uploadx/releases/latest
