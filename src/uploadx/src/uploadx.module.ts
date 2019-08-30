import { NgModule } from '@angular/core';
import { UploadxDropDirective } from './uploadx-drop.directive';
import { UploadxDirective } from './uploadx.directive';

@NgModule({
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {}
