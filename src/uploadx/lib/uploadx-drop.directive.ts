import { ContentChild, Directive, HostBinding, HostListener } from '@angular/core';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Directive({
  selector: '[uploadxDrop]',
  standalone: true
})
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
    const files = this.getFiles(event);
    if (files.length) {
      this.fileInput ? this.fileInput.fileListener(files) : this.uploadService.handleFiles(files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    this._stopEvents(event);
    if (event.dataTransfer?.items[0]?.kind === 'file') {
      if (this.fileInput?.options.multiple === false && event.dataTransfer.items.length > 1) {
        event.dataTransfer.dropEffect = 'none';
      } else {
        event.dataTransfer.dropEffect = 'copy';
        this.active = true;
      }
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    this._stopEvents(event);
    this.active = false;
  }

  /**
   * Extracts the files from a `DragEvent` object
   */
  getFiles(event: DragEvent): FileList | File[] {
    const dataTransfer = new DataTransfer();
    const items = event.dataTransfer?.items;
    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && !item.webkitGetAsEntry()?.isDirectory) {
          const file = item.getAsFile();
          file && dataTransfer.items.add(file);
        }
      }
    }
    return dataTransfer.files;
  }

  protected _stopEvents(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
