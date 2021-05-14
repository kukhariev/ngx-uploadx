import { ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { Directive, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { UploadState, UploadxControlEvent } from './interfaces';
import { UploadxOptions } from './options';
import { UploadxService } from './uploadx.service';

@Directive({ selector: '[uploadx]' })
export class UploadxDirective implements OnInit {
  @Input()
  set uploadx(value: UploadxOptions | '') {
    if (value) {
      this.options = value;
    }
  }

  @Input() options: UploadxOptions = {};

  @Input() set control(value: UploadxControlEvent | '') {
    if (value) {
      this.uploadService.control(value);
    }
  }

  @Output() state = new EventEmitter<UploadState>();

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

    this.uploadService.events
      .pipe(takeWhile(_ => this.state.observers.length > 0))
      .subscribe(this.state);
  }

  @HostListener('change', ['$event.target.files'])
  fileListener(files: FileList): void {
    if (files && files.item(0)) {
      this.uploadService.handleFiles(files, this.options);
    }
  }
}
