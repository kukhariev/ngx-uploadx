import { NO_ERRORS_SCHEMA, ɵivyEnabled as ivyEnabled } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });
  it('ivy enabled', () => {
    expect(ivyEnabled).toBeTruthy();
  });
  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });
});
