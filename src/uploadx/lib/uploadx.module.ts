import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { UPLOADX_OPTIONS, UploadxOptions } from './interfaces';
import { UploadxDropDirective } from './uploadx-drop.directive';
import { UploadxDirective } from './uploadx.directive';

@NgModule({
  declarations: [UploadxDirective, UploadxDropDirective],
  exports: [UploadxDirective, UploadxDropDirective]
})
export class UploadxModule {
  constructor(@Optional() @SkipSelf() parentModule: UploadxModule) {
    if (parentModule) {
      throw new Error('UploadxModule is already loaded. Import it in the AppModule only');
    }
  }

  static withConfig(options: UploadxOptions): ModuleWithProviders {
    return {
      ngModule: UploadxModule,
      providers: [{ provide: UPLOADX_OPTIONS, useValue: options }]
    };
  }
}
