import { Component, DoCheck, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements DoCheck {
  hidden = true;
  changes = 0;

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  @HostListener('drop', ['$event'])
  disable(event: DragEvent): void {
    if (event && event.dataTransfer) {
      event.preventDefault();
      event.dataTransfer.effectAllowed = 'none';
      event.dataTransfer.dropEffect = 'none';
    }
  }

  ngDoCheck(): void {
    console.log('change-detection ', this.changes++);
  }
}
