import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UploadxDirective, UPLOADX_AJAX } from 'ngx-uploadx';
import { timer } from 'rxjs';
import { DirectiveWayComponent } from './directive-way.component';

const file = new File([''], 'filename.mp4');
const files: FileList = {
  0: file,
  length: 1,
  item: () => file
};
describe('DirectiveWayComponent', () => {
  let comp: DirectiveWayComponent;
  let fixture: ComponentFixture<DirectiveWayComponent>;
  let directiveElement: DebugElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [DirectiveWayComponent, UploadxDirective],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });
    fixture = TestBed.createComponent(DirectiveWayComponent);
    comp = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(UploadxDirective));
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  it('should set request options', async () => {
    directiveElement.triggerEventHandler('change', { target: { files } });
    const ajax = fixture.debugElement.injector.get(UPLOADX_AJAX);
    const response = { data: { error: 'error' }, headers: {}, status: 400 };
    const ajaxSpy = spyOn(ajax, 'request').and.resolveTo(response);
    await timer(10).toPromise();
    const { headers, url, data } = ajaxSpy.calls.mostRecent().args[0];
    expect(url).toBe(comp.options.endpoint!);
    expect(headers!['Authorization']).toContain('Bearer ');
    expect(headers!['X-Upload-Content-Length']).toBe('0');
    expect(JSON.parse(data as string)).toEqual(jasmine.objectContaining({ size: 0 }));
  });
});
