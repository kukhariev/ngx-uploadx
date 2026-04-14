import { Component } from '@angular/core';
import { MultiInstanceAComponent } from './a/multi-instance-a.component';
import { MultiInstanceBComponent } from './b/multi-instance-b.component';

@Component({
  selector: 'app-multi-instances',
  standalone: true,
  imports: [MultiInstanceAComponent, MultiInstanceBComponent],
  templateUrl: './multi-instances.component.html'
})
export class MultiInstancesComponent {}
