# ngx-uploadx

> Angular Resumable Upload Module

[![npm version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

## Key Features

- Pause / Resume / Cancel Uploads
- Retries using exponential back-off strategy
- Chunking

## Setup

- Add ngx-uploadx module as dependency :

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

## Basic usage

```ts
// Component code
//...
import { Observable } from 'rxjs';
import { UploadxOptions, UploadState } from 'ngx-uploadx';

@Component({
  selector: 'app-home',
  templateUrl: `
  <input type="file" [uploadx]="options" (uploadxState)="onUpload($event)">
  `
})

export class AppHomeComponent {
  options: UploadxOptions = { url: `[URL]`};
  onUpload(state: Observable<UploadState>) {
    state
      .subscribe((item: UploadState) => {
         console.log(item);
         //...
      }
 }
```

> Please navigate to the [src/app sub-folder](src/app) for more detailed examples

## Server-side setup

- [node-uploadx](https://github.com/kukhariev/node-uploadx)

## Options

- `allowedTypes`: allowed file type filtering (directive only)

- `autoUpload`: automatically start upload when files added. Default value: `true`

- `chunkSize`: set a fixed chunk size. If not specified, the optimal size will be automatically adjusted based on the network speed.

- `concurrency`: set the maximum parallel uploads. Default value: `2`

- `headers`: headers to be appended to each HTTP request

- `metadata`: add custom metadata to upload

- `uploaderClass`: provide a user-defined class to support another upload protocol or to extend an existing one. Examples : [internal](src/uploadx/src/uploaderx.ts) and [uploader-examples](uploader-examples)

- `token`: authorization Bearer token as a `string` or function returning a `string` or `Promise<string>`.

- `endpoint`: URL to create new uploads. Default value: `'/upload'`

## Directive

```html
<input
  type="file"
  [uploadx]="options"
  [uploadxAction]="control"
  (uploadxState)="onUpload($event)"
/>
```

### Selector

#### \[uploadx\]

### inputs

#### \[uploadx\]: _UploadxOptions_

#### \[uploadxAction\]: _UploadxControlEvent_

### Output

#### (uploadxState): \$event _\<Observable\>UploadState_

## Service

### UploadxService

### Public Methods

#### init(options: _UploadxOptions_): _Observable\<UploadState\>_

> Initializes service. Returns Observable that emits a new value on progress or status changes

```ts
// example:
uploadxOptions: UploadxOptions = {
  concurrency: 2,
  endpoint: `${environment.api}/upload`,
  token:  () => localStorage.getItem('access_token'),
};
ngOnInit() {
  this.uploadService.init(this.uploadxOptions)
    .subscribe((item: UploadState) => {
      console.log(item);
      //...
    }
}
```

#### connect(options?: _UploadxOptions_): _Observable\<Uploader[]\>_

> Initializes service. Returns Observable that emits the current queue

```ts
// example:
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
    token:  () => localStorage.getItem('access_token'),
  }
  constructor(private uploadService: UploadxService) {
    this.uploads$ = this.uploadService.connect(this.options);
  }
```

#### disconnect(): _\<void\>_

> Terminate all uploads and clears the queue

#### handleFile(file: File): _\<void\>_

> Create Uploader for the file and add to the queue

#### handleFileList(fileList: _FileList_): _\<void\>_

> Add files to the upload queue

#### control(event: _UploadxControlEvent_): _void_

> Send event

```ts
// example:

pause(uploadId: string) {
  this.uploadService.control({ action: 'pause', uploadId });
}
```

### Public props

#### queue: Uploader[]

> Uploaders array

#### events: _Observable\<UploadState\>_

> Uploadx Events

## Interfaces

### UploadxOptions interface

| Name                | Defaults? | Description                              |
| ------------------- | :-------: | ---------------------------------------- |
| **[allowedTypes]**  |     -     | _Set "accept" attribute_                 |
| **[autoUpload]**    |   true    | _Auto upload with global options_        |
| **[chunkSize]**     |   auto    | _Force constant chunk size_              |
| **[concurrency]**   |     2     | _Limit the number of concurrent uploads_ |
| **[headers]**       |     -     | _Custom headers_                         |
| **[uploaderClass]** | UploaderX | _Upload API implementation_              |
| **[token]**         |     -     | _Auth Bearer token \/ token Getter_      |
| **[endpoint]**      | "/upload" | _API URL_                                |

### _\<Observable\>_ UploadState

| Name               |      Type      | Description                                                                         |
| ------------------ | :------------: | ----------------------------------------------------------------------------------- |
| **file**           |     _File_     | _FileAPI File_                                                                      |
| **name**           |    _string_    | _file name_                                                                         |
| **percentage**     |    _number_    | _progress percentage_                                                               |
| **remaining**      |    _number_    | _ETA_                                                                               |
| **response**       |     _any_      | _response body_                                                                     |
| **responseStatus** |    _number_    | _response’s status_                                                                 |
| **size**           |    _number_    | _file size_                                                                         |
| **speed**          |    _number_    | _upload speed bytes/sec_                                                            |
| **status**         | _UploadStatus_ | _'added', 'queue', 'uploading', 'complete','retry', 'error', 'cancelled', 'paused'_ |
| **uploadId**       |    _string_    | _upload id_                                                                         |
| **URI**            |    _string_    | _file URI_                                                                          |

### UploadItem

> Item custom options, override globals

| Name           |            Type             | Description                         |
| -------------- | :-------------------------: | ----------------------------------- |
| **[method]**   |          _string_           | _API initial method_                |
| **[uploadId]** |          _string_           | _internal upload id \( ReadOnly \)_ |
| **[URI]**      |          _string_           | _Item URL_                          |
| **[headers]**  | _{ [key: string]: string }_ | _Add custom headers_                |
| **[metadata]** |            _any_            | _Add custom data_                   |
| **[endpoint]** |           string            | _Custom url_                        |

### UploadxControlEvent

>

| Name              |      Type      | Description                                                                        |
| ----------------- | :------------: | ---------------------------------------------------------------------------------- |
| **action**        | _UploadAction_ | _'uploadAll', 'upload', 'cancel', 'cancelAll', 'pauseAll, 'pause', 'refreshToken'_ |
| **[uploadId]**    |    _string_    | _upload id \( ReadOnly \)_                                                         |
| **[itemOptions]** |  _UploadItem_  | _custom options_                                                                   |

## Run demo

- Start server `npm run server`
- Run demo app `npm start`
- Navigate to `http://localhost:4200/`

## Build

Run `npm run build` to build the lib.

> _packaged by_ [ng-packagr](https://github.com/dherges/ng-packagr)

## Contributing

Pull requests are welcome!

## References

- [https://developers.google.com/drive/v3/web/resumable-upload](https://developers.google.com/drive/v3/web/resumable-upload)

## License

The MIT License (see the [LICENSE](LICENSE) file for the full text)

[npm-image]: https://img.shields.io/npm/v/ngx-uploadx.svg
[npm-url]: https://www.npmjs.com/package/ngx-uploadx
[travis-image]: https://travis-ci.org/kukhariev/ngx-uploadx.svg?branch=master
[travis-url]: https://travis-ci.org/kukhariev/ngx-uploadx
