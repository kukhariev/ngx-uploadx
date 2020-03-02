import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UploadxDropDirective } from './uploadx-drop.directive';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Component({
  template: `
    <label uploadxDrop>
      <input type="file" [uploadx]="options" />
    </label>
  `
})
class UploadxTestComponent {
  options = { endpoint: `/upload/?parts=test` };
}

const file = new File([''], 'filename.mp4');
const files: FileList = {
  0: file,
  length: 1,
  item: () => file
};

describe('Directive: UploadxDropDirective', () => {
  let fixture: ComponentFixture<UploadxTestComponent>;
  let dropEl: DebugElement;
  let service: UploadxService;
  let serviceHandleFileListSpy: jasmine.Spy;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadxTestComponent, UploadxDirective, UploadxDropDirective],
      providers: [UploadxService]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadxTestComponent);
    dropEl = fixture.debugElement.query(By.directive(UploadxDropDirective));
    service = fixture.debugElement.injector.get<UploadxService>(UploadxService);
    serviceHandleFileListSpy = spyOn(service, 'handleFileList');
  });

  it('should ignore non files dragover', () => {
    const dragoverEvent = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
    dragoverEvent.dataTransfer = {};
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    expect(dragoverEvent.stopPropagation).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(false);
  });

  it('should set class on dragover', () => {
    const dragoverEvent = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
    dragoverEvent.dataTransfer = { files };
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    expect(dragoverEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(dragoverEvent.preventDefault).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(true);
  });

  it('should remove class on dragleave', () => {
    const dragoverEvent = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
    dragoverEvent.dataTransfer = { files };
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(true);
    const dragleaveEvent = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
    dropEl.triggerEventHandler('dragleave', dragleaveEvent);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(false);
  });

  it('should call HandleFileList', () => {
    const dropEvent = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
    dropEvent.dataTransfer = { files };
    dropEl.triggerEventHandler('drop', dropEvent);
    fixture.detectChanges();
    expect(dropEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(dropEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(serviceHandleFileListSpy).toHaveBeenCalledTimes(1);
  });
});
