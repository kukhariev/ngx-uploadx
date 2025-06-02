import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UploadxModule } from 'ngx-uploadx';
import { AppComponent } from './app';
import { serverUrl } from './config';
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { AppRoutingModule } from './app-routing-module';

@NgModule({
  declarations: [AppComponent, DirectiveWayComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    UploadxModule.withConfig({
      allowedTypes: 'image/*,video/*',
      endpoint: `${serverUrl}/files?uploadType=uploadx`,
      headers: { 'ngsw-bypass': 'true' },
      retryConfig: { maxAttempts: 5 }
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
