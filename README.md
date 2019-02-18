# ngx-uploadx

> Angular Resumable Upload Module

[![npm version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

## Key Features

- Pause / Resume / Cancel Uploads
- Retries using exponential back-off strategy
- Chunking

## Setups

- Add ngx-uploadx module as dependency :

```sh
  npm install ngx-uploadx
```

- Import UploadxModule in the root module:

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

## Server-side setup

- [node-uploadx](https://github.com/kukhariev/node-uploadx)

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

\[uploadx\]

### inputs

- \[uploadx\]: _UploadxOptions_
- \[uploadxAction\]: _UploadxControlEvent_

### Output

- (uploadxState): \$event _\<Observable\>UploadState_

## Service

UploadxService

### Public Methods

- init(options: _UploadxOptions_): _Observable\<UploadState\>_

  > Set global module options

  ```ts
  // example:
  uploadxOptions: UploadxOptions = {
    concurrency: 2,
    allowedTypes: 'image/*,video/*',
    endpoint: `${environment.api}/upload?uploadType=uploadx`,
    token:  () => {
      return localStorage.getItem('access_token');
    },
    autoUpload: false,
    chunkSize: 1024 * 256 * 8
  };
  ngOnInit() {
    this.uploadService.init(this.uploadxOptions)
      .subscribe((item: UploadState) => {
        console.log(item);
        //...
      }
  }
  ```

- handleFileList(fileList: _FileList_): _void_
  > Add files to the upload queue
- control(event: _UploadxControlEvent_): _void_

  > Send event

  ```ts
  // example:

  pause(uploadId: string) {
    this.uploadService.control({ action: 'pause', uploadId });
  }
  ```

## Interfaces

### UploadxOptions

| Name                  | Defaults?  | Description                              |
| --------------------- | :--------: | ---------------------------------------- |
| **[allowedTypes]**    |     -      | _Set "accept" attribute_                 |
| **[autoUpload]**      |    true    | _Auto upload with global options_        |
| **[chunkSize]**       |     0      | _If set to > 0 use chunked upload_       |
| **[concurrency]**     |     2      | _Limit the number of concurrent uploads_ |
| **[headers]**         |     -      | _Custom headers_                         |
| **[method]**          |   "POST"   | _Upload API initial method_              |
| **[token]**           |     -      | _Auth Bearer token _                     |
| **[endpoint]**        | "/upload/" | _API URL_                                |
| **[url]**             | "/upload/" | _(alias) API URL_                        |
| **[withCredentials]** |   false    | _Use withCredentials xhr option_         |

### _\<Observable\>_ UploadState

| Name           |      Type      | Description                                                                 |
| -------------- | :------------: | --------------------------------------------------------------------------- |
| **file**       |     _File_     | _FileAPI File_                                                              |
| **name**       |    _string_    | _file name_                                                                 |
| **progress**   |    _number_    | _progress percentage_                                                       |
| **percentage** |    _number_    | _(alias) progress percentage_                                               |
| **remaining**  |    _number_    | _ETA_                                                                       |
| **response**   |     _any_      | _success/error response_                                                    |
| **size**       |    _number_    | _file size_                                                                 |
| **speed**      |    _number_    | _upload speed bytes/sec_                                                    |
| **status**     | _UploadStatus_ | _'added', 'queue', 'uploading', 'complete', 'error', 'cancelled', 'paused'_ |
| **uploadId**   |    _string_    | _internal upload id_                                                        |
| **URI**        |    _string_    | _file URI_                                                                  |

### UploadItem

> Item custom options, override globals

| Name           |            Type             | Description                         |
| -------------- | :-------------------------: | ----------------------------------- |
| **[method]**   |          _string_           | _API initial method_                |
| **[uploadId]** |          _string_           | _internal upload id \( ReadOnly \)_ |
| **[URI]**      |          _string_           | _Item URL_                          |
| **[headers]**  | _{ [key: string]: string }_ | _Add custom headers_                |
| **[metadata]** |            _any_            | _Add custom data_                   |

### UploadxControlEvent

>

| Name              |      Type      | Description                                                                        |
| ----------------- | :------------: | ---------------------------------------------------------------------------------- |
| **action**        | _UploadAction_ | _'uploadAll', 'upload', 'cancel', 'cancelAll', 'pauseAll, 'pause', 'refreshToken'_ |
| **[uploadId]**    |    _string_    | _internal upload id \( ReadOnly \)_                                                  |
| **[itemOptions]** |  _UploadItem_  | _Item custom options_                                                              |

## Run demo

- Start server `npm run server`
- Run demo app `npm start`
- Navigate to `http://localhost:4200/`

## Build

Run `npm run build` to build the lib.

> _packaged by_ [ng-packagr](https://github.com/dherges/ng-packagr)

## Contributing

Pull requests are welcome!

## Links

- [https://developers.google.com/drive/v3/web/resumable-upload](https://developers.google.com/drive/v3/web/resumable-upload)

## License

The MIT License (see the [LICENSE](LICENSE) file for the full text)

[npm-image]: https://img.shields.io/npm/v/ngx-uploadx.svg
[npm-url]: https://www.npmjs.com/package/ngx-uploadx
[travis-image]: https://travis-ci.org/kukhariev/ngx-uploadx.svg?branch=master
[travis-url]: https://travis-ci.org/kukhariev/ngx-uploadx
