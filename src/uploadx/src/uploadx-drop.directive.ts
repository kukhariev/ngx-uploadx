import { ContentChild, Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Directive({
  selector: '[uploadxDrop]'
})
export class UploadxDropDirective {
  @HostBinding('class.uploadx-drop-active')
  active = false;

  @ContentChild(UploadxDirective)
  fileInput: UploadxDirective;
  constructor(private uploadService: UploadxService) {}

  @HostListener('drop', ['$event'])
  dropHandler(event: DragEvent) {
    if (event.dataTransfer) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      this.active = false;
      const files = event.dataTransfer.files;
      if (files && files.item(0)) {
        this.uploadService.handleFileList(files, this.fileInput.uploadx);
      }
    }
  }
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.active = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    this.active = false;
  }
}
