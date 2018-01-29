
import { DirectiveWayComponent } from './directive-way/directive-way.component';
import { ServiceWayComponent } from './service-way/service-way.component';

export const AppRoutes = [
  { path: '', redirectTo: 'directive-way', pathMatch: 'full' },
  { path: 'directive-way', component: DirectiveWayComponent },
  { path: 'service-way', component: ServiceWayComponent }
];


