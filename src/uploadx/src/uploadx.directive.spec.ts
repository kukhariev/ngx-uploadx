/* tslint:disable:no-unused-variable */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UploadxService } from './uploadx.service';
import { UploadxDirective } from './uploadx.directive';

@Component({
  template: `
    <input type="file" [uploadx]="options" />
  `
})
class TestuploadxComponent {
  options = {
    allowedTypes: 'image/*,video/*',
    url: `http://localhost:3003/upload/?parts=test`
  };
  constructor(private uploadService: UploadxService) {}
}

describe('Directive: UploadxDirective', () => {
  let component: TestuploadxComponent;
  let fixture: ComponentFixture<TestuploadxComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestuploadxComponent, UploadxDirective],
      providers: [UploadxService]
    });
    fixture = TestBed.createComponent(TestuploadxComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('has attribute "accept"', () => {
    fixture.detectChanges();
    expect(inputEl.nativeElement.hasAttribute('accept')).toBe(true);
  });
});
