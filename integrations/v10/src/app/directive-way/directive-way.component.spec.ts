import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { DirectiveWayComponent } from './directive-way.component';

describe('DirectiveWayComponent', () => {
  let comp: DirectiveWayComponent;
  let fixture: ComponentFixture<DirectiveWayComponent>;

  beforeEach(() => {
    const observableStub = {};
    TestBed.configureTestingModule({
      declarations: [DirectiveWayComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Observable, useValue: observableStub }]
    });
    fixture = TestBed.createComponent(DirectiveWayComponent);
    comp = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });
});
