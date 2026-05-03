import { type Mock } from 'vitest';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UploadxOptions } from './options';
import { UploadxDropDirective } from './uploadx-drop.directive';
import { UploadxDirective } from './uploadx.directive';
import { UploadxService } from './uploadx.service';

@Component({
  template: `
    <label uploadxDrop>
      <input type="file" [uploadx]="options" />
    </label>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false
})
class UploadxTestComponent {
  options: UploadxOptions = { endpoint: `/upload/?parts=test`, multiple: false };
}

const file = new File([''], 'filename.mp4');

describe('Directive: UploadxDropDirective', () => {
  let fixture: ComponentFixture<UploadxTestComponent>;
  let dropEl: DebugElement;
  let serviceHandleFiles: Mock;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadxTestComponent],
      imports: [UploadxDirective, UploadxDropDirective],
      providers: [UploadxService]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadxTestComponent);
    dropEl = fixture.debugElement.query(By.directive(UploadxDropDirective));
    const service = fixture.debugElement.injector.get<UploadxService>(UploadxService);
    serviceHandleFiles = vi.spyOn(service, 'handleFiles');
    fixture.detectChanges();
  });

  it('should ignore non files dragover', () => {
    const dragoverEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation'),
      dataTransfer: new DataTransfer()
    };
    dragoverEvent.dataTransfer = new DataTransfer();
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    expect(serviceHandleFiles).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(false);
  });

  it('should not allow more than one if `multiple` disabled', () => {
    const dragoverEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation'),
      dataTransfer: new DataTransfer()
    };
    dragoverEvent.dataTransfer = new DataTransfer();
    dragoverEvent.dataTransfer.items.add(file);
    dragoverEvent.dataTransfer.items.add(file);
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    expect(serviceHandleFiles).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(false);
  });

  it('should set class on dragover', () => {
    const dragoverEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation'),
      dataTransfer: new DataTransfer()
    };
    dragoverEvent.dataTransfer = new DataTransfer();
    dragoverEvent.dataTransfer.items.add(file);
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    expect(dragoverEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(dragoverEvent.preventDefault).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(true);
  });

  it('should remove class on dragleave', () => {
    const dragoverEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation'),
      dataTransfer: new DataTransfer()
    };
    dragoverEvent.dataTransfer = new DataTransfer();
    dragoverEvent.dataTransfer.items.add(file);
    dropEl.triggerEventHandler('dragover', dragoverEvent);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(true);
    const dragleaveEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation')
    };
    dropEl.triggerEventHandler('dragleave', dragleaveEvent);
    fixture.detectChanges();
    expect(dropEl.nativeElement.classList.contains('uploadx-drop-active')).toBe(false);
  });

  it('should call HandleFiles', () => {
    const directive = dropEl.injector.get(UploadxDropDirective);
    vi.spyOn(directive, 'getFiles').mockReturnValue([file] as unknown as FileList);

    const dropEvent = {
      preventDefault: vi.fn().mockName('event.preventDefault'),
      stopPropagation: vi.fn().mockName('event.stopPropagation'),
      dataTransfer: new DataTransfer()
    } as unknown as DragEvent;

    dropEl.triggerEventHandler('drop', dropEvent);
    fixture.detectChanges();

    expect(dropEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(dropEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(serviceHandleFiles).toHaveBeenCalledTimes(1);
  });
});
