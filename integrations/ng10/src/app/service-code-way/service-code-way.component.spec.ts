import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { ServiceCodeWayComponent } from './service-code-way.component';

describe('ServiceCodeWayComponent', () => {
  let comp: ServiceCodeWayComponent;
  let fixture: ComponentFixture<ServiceCodeWayComponent>;
  let uploadService: UploadxService;

  beforeEach(() => {
    const observableStub = {};
    const uploadServiceStub = {
      init: jasmine.createSpy('init'),
      control: jasmine.createSpy('control'),
      handleFile: jasmine.createSpy('handleFile')
    };
    TestBed.configureTestingModule({
      declarations: [ServiceCodeWayComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Observable, useValue: observableStub },
        { provide: UploadxService, useValue: uploadServiceStub }
      ]
    });
    fixture = TestBed.createComponent(ServiceCodeWayComponent);
    uploadService = TestBed.get(UploadxService);
    comp = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  describe('cancelAll', () => {
    it('makes expected calls', () => {
      comp.cancel();
      expect(uploadService.control).toHaveBeenCalled();
    });
  });

  describe('uploadAll', () => {
    it('makes expected calls', () => {
      comp.upload();
      expect(uploadService.control).toHaveBeenCalled();
    });
  });

  describe('pauseAll', () => {
    it('makes expected calls', () => {
      comp.pause();
      expect(uploadService.control).toHaveBeenCalled();
    });
  });

  describe('onChange', () => {
    it('should upload the files after the input files change', async(() => {
      const dataTransfer = new ClipboardEvent('').clipboardData || new DataTransfer();
      dataTransfer.items.add(new File(['foo'], 'programmatically_created.txt'));
      spyOn(comp, 'getFiles').and.returnValue(dataTransfer.files);
      comp.onChange();
      expect(uploadService.handleFile).toHaveBeenCalled();
    }));
  });
});
