import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@NgModule({
  imports: [CommonModule],
  declarations: [UploadxDirective],
  exports: [UploadxDirective],
  providers: [UploadxService]
})
export class UploadxModule {}
