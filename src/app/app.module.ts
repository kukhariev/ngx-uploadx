import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UploadxModule } from '../uploadx';
import { AppRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { ServiceWayComponent } from './service-way/service-way.component';
import { ServiceCodeWayComponent } from './service-code-way/service-code-way.component';
import { OnPushComponent } from './on-push/on-push.component';
import { MultipleDirectiveComponent } from './multiple-directive/multiple-directive.component';

@NgModule({
  declarations: [
    AppComponent,
    DirectiveWayComponent,
    ServiceWayComponent,
    ServiceCodeWayComponent,
    OnPushComponent,
    MultipleDirectiveComponent
  ],
  imports: [RouterModule.forRoot(AppRoutes), BrowserModule, UploadxModule],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
