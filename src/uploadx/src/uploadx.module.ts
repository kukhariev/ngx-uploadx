import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadxDirective } from './uploadx.directive';
import { UploadxDropDirective } from './uploadx-drop.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {}
