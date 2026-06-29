import { Routes } from '@angular/router';
import { FileGeneratorComponent } from './file-generator/file-generator.component';
import { MultiFilesDirectiveComponent } from './multi-files-directive/multi-files-directive.component';
import { MultiInstancesComponent } from './multi-instances/multi-instances.component';
import { MultipartUploadComponent } from './multipart-upload/multipart-upload.component';
import { S3UploadComponent } from './s3-upload/s3-upload.component';
import { ServiceUploadComponent } from './service-upload/service-upload.component';
import { SimpleUploadComponent } from './simple-upload/simple-upload.component';
import { TusComponent } from './tus/tus.component';
import { UploadxAdvancedComponent } from './uploadx-advanced/uploadx-advanced.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'simple-upload', pathMatch: 'full' },
  { path: 'simple-upload', component: SimpleUploadComponent },
  { path: 'uploadx-advanced', component: UploadxAdvancedComponent },
  { path: 's3-upload', component: S3UploadComponent },
  { path: 'multipart-upload', component: MultipartUploadComponent },
  { path: 'service-upload', component: ServiceUploadComponent },
  { path: 'multi-files-directive', component: MultiFilesDirectiveComponent },
  { path: 'multi-instances', component: MultiInstancesComponent },
  { path: 'tus', component: TusComponent },
  { path: 'file-generator', component: FileGeneratorComponent }
];
