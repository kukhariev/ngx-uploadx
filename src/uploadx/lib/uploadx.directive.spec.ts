import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { type Mock } from 'vitest';
import { UploadxControlEvent } from './interfaces';
import { UPLOADX_OPTIONS } from './options';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Component({
  template: ` <input type="file" [uploadx]="options" [control]="action" /> `,
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false
})
class UploadxTestComponent {
  options = {
    allowedTypes: 'image/*,video/*',
    endpoint: `http://localhost:3003/upload/?parts=test`
  };

  action: UploadxControlEvent = { action: 'pause' };
}

function buildFileList() {
  const dt = new DataTransfer();
  dt.items.add(new File([''], 'filename.mp4'));
  return dt.files;
}

describe('Directive: UploadxDirective', () => {
  let fixture: ComponentFixture<UploadxTestComponent>;
  let inputEl: DebugElement;
  let service: UploadxService;
  let serviceControlSpy: Mock;
  let serviceHandleFileListSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadxTestComponent],
      imports: [UploadxDirective],
      providers: [UploadxService, { provide: UPLOADX_OPTIONS, useValue: {} }]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadxTestComponent);
    inputEl = fixture.debugElement.query(By.css('input'));
    service = fixture.debugElement.injector.get<UploadxService>(UploadxService);
    serviceControlSpy = vi.spyOn(service, 'control');
    serviceHandleFileListSpy = vi.spyOn(service, 'handleFiles');
  });

  it('has attribute "accept"', () => {
    fixture.detectChanges();
    expect(inputEl.nativeElement.hasAttribute('accept')).toBe(true);
  });

  it('has attribute "multiple"', () => {
    fixture.detectChanges();
    expect(inputEl.nativeElement.hasAttribute('multiple')).toBe(true);
  });

  it('set control', () => {
    fixture.detectChanges();
    expect(serviceControlSpy).toHaveBeenCalled();
  });

  it('fileListener', () => {
    expect(buildFileList()).toHaveLength(1);
    inputEl.triggerEventHandler('change', { target: { files: buildFileList() } });
    fixture.detectChanges();
    expect(serviceHandleFileListSpy).toHaveBeenCalled();
  });
});
