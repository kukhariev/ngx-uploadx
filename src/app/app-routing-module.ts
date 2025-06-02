import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { FileGeneratorComponent } from './file-generator/file-generator.component';
import { MultiServiceComponent } from './multi-service/multi-service.component';
import { MultipleDirectiveComponent } from './multiple-directive/multiple-directive.component';
import { OnPushComponent } from './on-push/on-push.component';
import { ServiceCodeWayComponent } from './service-code-way/service-code-way.component';
import { ServiceWayComponent } from './service-way/service-way.component';
import { TusComponent } from './tus/tus.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'directive-way', pathMatch: 'full' },
  { path: 'directive-way', component: DirectiveWayComponent },
  { path: 'service-way', component: ServiceWayComponent },
  { path: 'service-code-way', component: ServiceCodeWayComponent },
  { path: 'on-push', component: OnPushComponent },
  { path: 'multi', component: MultipleDirectiveComponent },
  { path: 'multi2', component: MultiServiceComponent },
  { path: 'tus', component: TusComponent },
  { path: 'file-generator', component: FileGeneratorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
