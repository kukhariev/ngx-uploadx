import { Component } from '@angular/core';
import { DownloadComponent } from './download/download.component';

@Component({
  selector: 'app-file-generator',
  templateUrl: './file-generator.component.html',
  styleUrls: ['./file-generator.component.scss'],
  imports: [DownloadComponent]
})
export class FileGeneratorComponent {
  sizesMB = [10, 100, 500, 1000, 2000];
}
