import { NgModule } from '@angular/core';

import { UploadxDirective } from './uploadx.directive';
import { UploadxDropDirective } from './uploadx-drop.directive';

@NgModule({
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {}
