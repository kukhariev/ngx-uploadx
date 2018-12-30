import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadxDirective } from './uploadx.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [UploadxDirective],
  exports: [UploadxDirective]
})
export class UploadxModule {}
