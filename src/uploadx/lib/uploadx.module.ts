import { ModuleWithProviders, NgModule } from '@angular/core';
import { UPLOADX_OPTIONS, UploadxOptions } from './interfaces';
import { UploadxDropDirective } from './uploadx-drop.directive';
import { UploadxDirective } from './uploadx.directive';

@NgModule({
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {
  static withConfig(options: UploadxOptions): ModuleWithProviders<UploadxModule> {
    return {
      ngModule: UploadxModule,
      providers: [{ provide: UPLOADX_OPTIONS, useValue: options }]
    };
  }
}
