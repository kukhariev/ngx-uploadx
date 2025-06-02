import { Component } from '@angular/core';
import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-service',
  imports: [AComponent, BComponent, CommonModule],
  templateUrl: './multi-service.component.html',
  standalone: true
})
export class MultiServiceComponent {}
