import { NgModule } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxDropDirective } from './uploadx_drop.directive';

@NgModule({
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {}
