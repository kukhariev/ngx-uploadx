import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { Observable } from 'rxjs';
import { UploadState, UploadxControlEvent, UploadxOptions } from './interfaces';
import { UploadxService } from './uploadx.service';

@Directive({ selector: '[uploadx]' })
export class UploadxDirective implements OnInit {
  @Output()
  uploadxState = new EventEmitter<Observable<UploadState>>();

  @Input()
  set uploadx(value: UploadxOptions | string | null | undefined) {
    if (value && typeof value === 'object') {
      this.options = value;
    }
  }

  options: UploadxOptions = {};

  @Input()
  set uploadxAction(value: UploadxControlEvent | string | null | undefined) {
    if (value && typeof value === 'object') {
      this.uploadService.control(value);
    }
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private uploadService: UploadxService
  ) {}

  ngOnInit(): void {
    const { multiple, allowedTypes } = this.options;
    multiple !== false && this.renderer.setAttribute(this.elementRef.nativeElement, 'multiple', '');
    allowedTypes &&
      this.renderer.setAttribute(this.elementRef.nativeElement, 'accept', allowedTypes);

    this.uploadxState.emit(this.uploadService.events);
  }

  @HostListener('change', ['$event.target.files'])
  fileListener(files: FileList): void {
    if (files && files.item(0)) {
      this.uploadService.handleFileList(files, this.options);
    }
  }
}
