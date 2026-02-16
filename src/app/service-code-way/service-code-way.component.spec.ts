import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadxService } from 'ngx-uploadx';
import { ServiceCodeWayComponent } from './service-code-way.component';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('ServiceCodeWayComponent', () => {
  let comp: ServiceCodeWayComponent;
  let fixture: ComponentFixture<ServiceCodeWayComponent>;
  let service: UploadxService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: UploadxService }]
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = await TestBed.createComponent(ServiceCodeWayComponent);
    service = TestBed.inject(UploadxService);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  it('should upload the files after the input files change', () => {
    const dt = new DataTransfer();
    dt.items.add(new File([''], 'filename.txt'));
    vi.spyOn(comp, 'getFiles').mockReturnValue(dt.files);
    const handleFiles = vi.spyOn(service, 'handleFiles');
    comp.onChange();
    expect(handleFiles).toHaveBeenCalled();
  });
});
