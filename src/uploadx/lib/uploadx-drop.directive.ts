import { ContentChild, Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Directive({ selector: '[uploadxDrop]' })
export class UploadxDropDirective {
  @HostBinding('class.uploadx-drop-active')
  active = false;

  @ContentChild(UploadxDirective)
  fileInput?: UploadxDirective;

  constructor(private uploadService: UploadxService) {}

  @HostListener('drop', ['$event'])
  dropHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.item(0)) {
      event.stopPropagation();
      event.preventDefault();
      this.active = false;
      this.fileInput
        ? this.fileInput.fileListener(event.dataTransfer.files)
        : this.uploadService.handleFiles(event.dataTransfer.files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.files) {
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
