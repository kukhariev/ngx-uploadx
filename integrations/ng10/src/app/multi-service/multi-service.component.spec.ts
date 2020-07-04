import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MultiServiceComponent } from './multi-service.component';

describe('MultiServiceComponent', () => {
  let component: MultiServiceComponent;
  let fixture: ComponentFixture<MultiServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultiServiceComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
