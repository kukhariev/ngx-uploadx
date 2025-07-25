import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UploadxDirective } from 'ngx-uploadx';
import { MultipleDirectiveComponent } from './multiple-directive.component';

describe('MultipleDirectiveComponent', () => {
  let component: MultipleDirectiveComponent;
  let fixture: ComponentFixture<MultipleDirectiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UploadxDirective]
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
