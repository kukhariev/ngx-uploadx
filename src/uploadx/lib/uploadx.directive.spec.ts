import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UPLOADX_OPTIONS, UploadxControlEvent } from './interfaces';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Component({
  template: ` <input type="file" [uploadx]="options" [control]="action" /> `
})
class UploadxTestComponent {
  options = {
    allowedTypes: 'image/*,video/*',
    endpoint: `http://localhost:3003/upload/?parts=test`
  };
  action: UploadxControlEvent = { action: 'pause' };
}

const file = new File([''], 'filename.mp4');
const files: FileList = {
  0: file,
  length: 1,
  item: () => file
};

describe('Directive: UploadxDirective', () => {
  let fixture: ComponentFixture<UploadxTestComponent>;
  let inputEl: DebugElement;
  let service: UploadxService;
  let serviceControlSpy: jasmine.Spy;
  let serviceHandleFileListSpy: jasmine.Spy;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadxTestComponent, UploadxDirective],
      providers: [UploadxService, { provide: UPLOADX_OPTIONS, useValue: {} }]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadxTestComponent);

    inputEl = fixture.debugElement.query(By.css('input'));
    service = fixture.debugElement.injector.get<UploadxService>(UploadxService);
    serviceControlSpy = spyOn(service, 'control');
    serviceHandleFileListSpy = spyOn(service, 'handleFiles');
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
    inputEl.triggerEventHandler('change', { target: { files } });
    fixture.detectChanges();
    expect(serviceHandleFileListSpy).toHaveBeenCalled();
  });
});
