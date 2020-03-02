import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { TusComponent } from './tus.component';

describe('TusComponent', () => {
  let comp: TusComponent;
  let fixture: ComponentFixture<TusComponent>;

  beforeEach(() => {
    const observableStub = {};
    TestBed.configureTestingModule({
      declarations: [TusComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Observable, useValue: observableStub }]
    });
    fixture = TestBed.createComponent(TusComponent);
    comp = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });
});
