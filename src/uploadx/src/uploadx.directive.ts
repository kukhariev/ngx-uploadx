import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { UploadxControlEvent, UploadxOptions } from './interfaces';
import { UploadxService } from './uploadx.service';

@Directive({
  selector: '[uploadx]'
})
export class UploadxDirective implements OnInit, OnDestroy {
  listenerFn: () => void;
  @Output()
  uploadxState = new EventEmitter();
  @Input()
  uploadx: UploadxOptions;
  @Input()
  set uploadxAction(ctrlEvent: UploadxControlEvent) {
    if (ctrlEvent && this.uploadService) {
      this.uploadService.control(ctrlEvent);
    }
  }
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private uploadService: UploadxService
  ) {}

  ngOnInit() {
    if (this.uploadx) {
      if (this.uploadx.allowedTypes) {
        this.renderer.setAttribute(
          this.elementRef.nativeElement,
          'accept',
          this.uploadx.allowedTypes
        );
      }
    }
    this.uploadxState.emit(this.uploadService.events);
    this.listenerFn = this.renderer.listen(
      this.elementRef.nativeElement,
      'change',
      this.fileListener
    );
  }

  ngOnDestroy() {
    if (this.listenerFn) {
      this.listenerFn();
    }
  }

  fileListener = () => {
    if (this.elementRef.nativeElement.files) {
      this.uploadService.handleFileList(this.elementRef.nativeElement.files, this.uploadx);
    }
  };
}
