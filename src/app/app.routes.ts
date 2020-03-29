import { MultiServiceComponent } from 'src/app/multi-service/multi-service.component';
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { MultipleDirectiveComponent } from './multiple-directive/multiple-directive.component';
import { OnPushComponent } from './on-push/on-push.component';
import { ServiceCodeWayComponent } from './service-code-way/service-code-way.component';
import { ServiceWayComponent } from './service-way/service-way.component';
import { TusComponent } from './tus/tus.component';
export const appRoutes = [
  { path: '', redirectTo: 'directive-way', pathMatch: 'full' },
  { path: 'directive-way', component: DirectiveWayComponent },
  { path: 'service-way', component: ServiceWayComponent },
  { path: 'service-code-way', component: ServiceCodeWayComponent },
  { path: 'on-push', component: OnPushComponent },
  { path: 'multi', component: MultipleDirectiveComponent },
  { path: 'multi2', component: MultiServiceComponent },
  { path: 'tus', component: TusComponent }
];
