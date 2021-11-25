import { ContentChild, Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Directive({ selector: '[uploadxDrop]' })
export class UploadxDropDirective {
  @HostBinding('class.uploadx-drop-active')
  active = false;

  @ContentChild(UploadxDirective, { static: false })
  fileInput?: UploadxDirective;

  constructor(private uploadService: UploadxService) {}

  @HostListener('drop', ['$event'])
  dropHandler(event: DragEvent): void {
    this._stopEvents(event);
    this.active = false;
    if (event.dataTransfer && event.dataTransfer.files.item(0)) {
      this.fileInput
        ? this.fileInput.fileListener(event.dataTransfer.files)
        : this.uploadService.handleFiles(event.dataTransfer.files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    this._stopEvents(event);
    if (event.dataTransfer && event.dataTransfer.files.item(0)) {
      event.dataTransfer.dropEffect = 'copy';
      this.active = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    this._stopEvents(event);
    this.active = false;
  }

  protected _stopEvents(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
