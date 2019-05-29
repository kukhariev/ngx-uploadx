import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleDirectiveComponent } from './multiple-directive.component';
import { UploadxDirective } from '../../uploadx/src/uploadx.directive';

describe('MultipleDirectiveComponent', () => {
  let component: MultipleDirectiveComponent;
  let fixture: ComponentFixture<MultipleDirectiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultipleDirectiveComponent, UploadxDirective]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
