import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.menuIsHidden).toBe(true);
    expect(component.changes).toBe(0);
  });

  it('should prevent drag events', () => {
    const event = new DragEvent('dragover');
    event.preventDefault = vi.fn();
    Object.defineProperty(event, 'dataTransfer', {
      value: { effectAllowed: 'all', dropEffect: 'copy' }
    });

    component.disable(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.dataTransfer?.effectAllowed).toBe('none');
    expect(event.dataTransfer?.dropEffect).toBe('none');
  });

  it('should increment changes on ngDoCheck', () => {
    const initial = component.changes;
    component.ngDoCheck();
    expect(component.changes).toBe(initial + 1);
  });
});
