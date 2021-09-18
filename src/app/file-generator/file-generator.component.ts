import { Component } from '@angular/core';

@Component({
  selector: 'app-file-generator',
  templateUrl: './file-generator.component.html',
  styleUrls: ['./file-generator.component.scss']
})
export class FileGeneratorComponent {
  sizesMB = [10, 100, 500, 1000, 2000];
}
