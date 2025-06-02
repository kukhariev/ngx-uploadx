import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';

const MIB = 1024 * 1024;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'downloader',
  template: '<a (click)="generateAndDownload()">{{ size }}MB</a>',
  styleUrls: ['./download.component.scss'],
  standalone: true
})
export class DownloadComponent {
  @Input() size!: number;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  get filename(): string {
    return `${this.size}_MB.MP4`;
  }

  generateAndDownload(): void {
    const body = new Uint8Array(this.size * MIB);
    try {
      const blob = new Blob([body]);
      this.download(blob, this.filename);
    } catch (e) {
      console.error(e);
    }
  }

  download(blob: Blob, fileName: string): void {
    if (this.document.defaultView) {
      const a = this.document.createElement('a');
      this.document.body.appendChild(a);
      const url = this.document.defaultView.URL.createObjectURL(blob);
      a.setAttribute('style', 'display:none;');
      a.href = url;
      a.download = fileName;
      a.click();
      this.document.defaultView.URL.revokeObjectURL(url);
      this.document.body.removeChild(a);
    }
  }
}
