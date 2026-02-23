import { Component } from '@angular/core';
import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';

@Component({
  selector: 'app-multi-service',
  standalone: true,
  imports: [AComponent, BComponent],
  templateUrl: './multi-service.component.html'
})
export class MultiServiceComponent {}
