import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UPLOADX_AJAX, UploadxDirective, provideUploadx } from 'ngx-uploadx';
import { timer } from 'rxjs';

import { StandaloneComponent } from './standalone.component';

const file = new File([''], 'filename.mp4');
const files: FileList = {
  0: file,
  length: 1,
  item: () => file
};

describe('StandaloneComponent', () => {
  let component: StandaloneComponent;
  let fixture: ComponentFixture<StandaloneComponent>;
  let directiveElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandaloneComponent],
      providers: [provideUploadx({ headers: { test: 'test' } })]
    }).compileComponents();

    fixture = TestBed.createComponent(StandaloneComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(UploadxDirective));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set request options', async () => {
    directiveElement.triggerEventHandler('change', { target: { files } });
    const ajax = fixture.debugElement.injector.get(UPLOADX_AJAX);
    const response = { data: { error: 'error' }, headers: {}, status: 400 };
    const ajaxSpy = spyOn(ajax, 'request').and.resolveTo(response);
    await timer(10).toPromise();
    const { headers = {}, data } = ajaxSpy.calls.mostRecent().args[0];
    expect(headers['Authorization']).toContain('Bearer ');
    expect(headers['X-Upload-Content-Length']).toBe(0);
    expect(headers['test']).toBe('test');
    expect(JSON.parse(data as string)).toEqual(jasmine.objectContaining({ size: 0 }));
  });
});
