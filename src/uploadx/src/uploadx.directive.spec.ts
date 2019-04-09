/* tslint:disable:no-unused-variable */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UploadxService } from './uploadx.service';
import { UploadxDirective } from './uploadx.directive';

@Component({
  template: `
    <input type="file" [uploadx]="options" [uploadxAction]="action" />
  `
})
class TestuploadxComponent {
  options = {
    allowedTypes: 'image/*,video/*',
    url: `http://localhost:3003/upload/?parts=test`
  };
  action = { action: 'pauseAll' };
  constructor(private uploadService: UploadxService) {}
}

describe('Directive: UploadxDirective', () => {
  let component: TestuploadxComponent;
  let fixture: ComponentFixture<TestuploadxComponent>;
  let inputEl: DebugElement;
  let uploadService: UploadxService;
  let uploadServiceSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestuploadxComponent, UploadxDirective],
      providers: [UploadxService]
    }).compileComponents();
    fixture = TestBed.createComponent(TestuploadxComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
    uploadService = fixture.debugElement.injector.get<UploadxService>(UploadxService);
    uploadServiceSpy = spyOn(uploadService, 'control').and.callThrough();
  });

  it('has attribute "accept"', () => {
    fixture.detectChanges();
    expect(inputEl.nativeElement.hasAttribute('accept')).toBe(true);
  });
  it('set uploadxAction', () => {
    fixture.detectChanges();
    expect(uploadServiceSpy).toHaveBeenCalled();
  });
});
