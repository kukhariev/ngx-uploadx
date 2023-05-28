import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UPLOADX_AJAX, UploadxDirective, UploadxModule } from 'ngx-uploadx';
import { DirectiveWayComponent } from './directive-way.component';

function buildFileList() {
  const dt = new DataTransfer();
  dt.items.add(new File([''], 'filename.mp4'));
  return dt.files;
}

describe('DirectiveWayComponent', () => {
  let comp: DirectiveWayComponent;
  let fixture: ComponentFixture<DirectiveWayComponent>;
  let directiveElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DirectiveWayComponent],
      imports: [UploadxModule]
    }).compileComponents();
    fixture = TestBed.createComponent(DirectiveWayComponent);
    comp = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(UploadxDirective));
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  it('should set request options', fakeAsync(() => {
    const ajax = fixture.debugElement.injector.get(UPLOADX_AJAX);
    const response = { data: { error: 'error' }, headers: {}, status: 400 };
    const ajaxSpy = spyOn(ajax, 'request').and.resolveTo(response);
    directiveElement.triggerEventHandler('change', { target: { files: buildFileList() } });
    tick();
    const { headers = {}, url, data } = ajaxSpy.calls.mostRecent().args[0];
    expect(url).toBe(comp.options.endpoint as string);
    expect(headers['Authorization']).toContain('Bearer ');
    expect(headers['X-Upload-Content-Length']).toBe(0);
    expect(JSON.parse(data as string)).toEqual(jasmine.objectContaining({ size: 0 }));
  }));
});
