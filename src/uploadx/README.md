# ngx-uploadx

> Angular 5+ Resumable Upload Module

[![Build Status](https://travis-ci.org/kukhariev/ngx-uploadx.svg?branch=master)](https://travis-ci.org/kukhariev/ngx-uploadx)

## Key Features

* Pause / Resume / Cancel Uploads
* Retries using exponential back-off strategy
* Chunking

## Setups

* Add ngx-uploadx module as dependency :

```sh
  npm install ngx-uploadx
```

* Import UploadxModule in the root module:

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
import { Observable } from 'rxjs/Observable';
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

## Directive

```html
<input type="file" [uploadx]="options" [uploadxAction]="control" (uploadxState)="onUpload($event)">
```

### Selector

\[uploadx\]

### inputs

* \[uploadx\]: *UploadxOptions*
* \[uploadxAction\]: *UploadxControlEvent*

### Output

* (uploadxState): $event *\<Observable\>UploadState*

## Service

UploadxService

### Public Methods

* init(options: *UploadxOptions*): *Observable\<UploadState\>*
  > Set global module options
  ```ts
  // example:

  ngOnInit() {
    this.uploadService.init(this.uploadxOptions)
      .subscribe((item: UploadState) => {
        console.log(item);
        //...
      }
  }
  ```
* handleFileList(fileList: *FileList*): *void*
  >Add files to the upload queue
* control(event: *UploadxControlEvent*): *void*
  >Send event
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
| **[allowedTypes]**    | -          | *Set "accept" attribute*                 |
| **[autoUpload]**      | true       | *Auto upload with global options*        |
| **[chunkSize]**       | 0          | *If set to > 0 use chunked upload*       |
| **[concurrency]**     | 2          | *Limit the number of concurrent uploads* |
| **[headers]**         | -          | *Custom headers*                         |
| **[method]**          | "POST"     | *Upload API initial method*              |
| **[token]**           | -          | *Auth Bearer token*                      |
| **[url]**             | "/upload/" | *API URL*                                |
| **[withCredentials]** | false      | *Use withCredentials xhr option*         |

### *\<Observable\>* UploadState

| Name          | Type           | Description                                                                 |
| ------------- | :------------: | --------------------------------------------------------------------------- |
| **file**      | *File*         | *FileAPI File*                                                              |
| **name**      | *string*       | *file name*                                                                 |
| **progress**  | *number*       | *progress percentage*                                                       |
| **remaining** | *number*       | *ETA*                                                                       |
| **response**  | *any*          | *success/error response*                                                    |
| **size**      | *number*       | *file size*                                                                 |
| **speed**     | *number*       | *upload speed bytes/sec*                                                    |
| **status**    | *UploadStatus* | *'added', 'queue', 'uploading', 'complete', 'error', 'cancelled', 'paused'* |
| **uploadId**  | *string*       | *Unique upload id*                                                          |

### UploadItem

  >Item custom options, override globals

| Name           | Type                                    | Description                       |
| -------------- | :-------------------------------------: | --------------------------------- |
| **[method]**   | *string*                                | *API initial method*              |
| **[uploadId]** | *string*                                | *Unique upload id \( ReadOnly \)* |
| **[url]**      | *string*                                | *Item URL*                        |
| **[headers]**  | *{ [key: string]: string } \| Function* | *Add custom headers*              |
| **[metadata]** | *any*                                   | *Add custom data*                 |

### UploadxControlEvent

  >

| Name              | Type           | Description                                                        |
| ----------------- | :------------: | ------------------------------------------------------------------ |
| **action**        | *UploadAction* | *'uploadAll', 'upload', 'cancel', 'cancelAll', 'pauseAll, 'pause'* |
| **[uploadId]**    | *string*       | *Unique upload id \( ReadOnly \)*                                  |
| **[itemOptions]** | *UploadItem*   | *Item custom options*                                              |

## Run demo

* Start server `npm run server`
* Run demo app  `npm start`
* Navigate to `http://localhost:4200/`

## Build

Run `npm run build` to build the lib.

> *packaged by* [ng-packagr](https://github.com/dherges/ng-packagr)

## Contributing

Pull requests are welcome!

## Links

* [https://developers.google.com/drive/v3/web/resumable-upload](https://developers.google.com/drive/v3/web/resumable-upload)
* [https://developer.vimeo.com/api/upload/videos#resumable-upload](https://developer.vimeo.com/api/upload/videos#resumable-upload)
* [https://developer.box.com/v2.0/reference#chunked-upload](https://developer.box.com/v2.0/reference#chunked-upload)

## License

The MIT License (see the [LICENSE](LICENSE) file for the full text)
