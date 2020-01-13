import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { UploadxModule } from 'ngx-uploadx';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { MultipleDirectiveComponent } from './multiple-directive/multiple-directive.component';
import { OnPushComponent } from './on-push/on-push.component';
import { ServiceCodeWayComponent } from './service-code-way/service-code-way.component';
import { ServiceWayComponent } from './service-way/service-way.component';
import { TusComponent } from './tus/tus.component';

@NgModule({
  declarations: [
    AppComponent,
    DirectiveWayComponent,
    ServiceWayComponent,
    ServiceCodeWayComponent,
    OnPushComponent,
    MultipleDirectiveComponent,
    TusComponent
  ],
  imports: [RouterModule.forRoot(appRoutes), BrowserModule, UploadxModule],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
