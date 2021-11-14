import { Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxService } from './uploadx.service';

@Directive({ selector: '[uploadxDrop]' })
export class UploadxDropDirective {
  @HostBinding('class.uploadx-drop-active')
  active = false;

  constructor(private uploadService: UploadxService) {}

  @HostListener('drop', ['$event'])
  dropHandler(event: DragEvent): void {
    if (event.dataTransfer?.files && event.dataTransfer.files.item(0)) {
      event.stopPropagation();
      event.preventDefault();
      this.active = false;
      this.uploadService.handleFiles(event.dataTransfer.files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (event.dataTransfer?.files && event.dataTransfer.files.item(0)) {
      event.dataTransfer.dropEffect = 'copy';
      event.stopPropagation();
      event.preventDefault();
      this.active = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    this.active = false;
  }
}
