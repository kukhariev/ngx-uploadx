import { ContentChild, Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';
import { typeis } from './utils';

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
    if (event.dataTransfer && this.validateMime(event)) {
      event.dataTransfer.dropEffect = 'copy';
      this.active = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    this._stopEvents(event);
    this.active = false;
  }

  protected _stopEvents(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  protected validateMime(event: DragEvent): boolean {
    if (event.dataTransfer?.items[0].kind === 'file') {
      const allowedTypes = this.fileInput?.options?.allowedTypes?.split(',') || ['*/*'];
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const mime = event.dataTransfer?.items[i].type;
        if (!typeis(mime, allowedTypes)) {
          event.dataTransfer.dropEffect = 'none';
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
