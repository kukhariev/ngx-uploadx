import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadxService } from 'ngx-uploadx';
import { Observable } from 'rxjs';
import { ServiceWayComponent } from './service-way.component';

describe('ServiceWayComponent', () => {
  let comp: ServiceWayComponent;
  let fixture: ComponentFixture<ServiceWayComponent>;

  beforeEach(() => {
    const observableStub = {};
    const uploadServiceStub = {
      init: () => ({}),
      control: () => ({})
    };
    TestBed.configureTestingModule({
      declarations: [ServiceWayComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Observable, useValue: observableStub },
        { provide: UploadxService, useValue: uploadServiceStub }
      ]
    });
    fixture = TestBed.createComponent(ServiceWayComponent);
    comp = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  // xdescribe('onUpload', () => {
  //   it('makes expected calls', () => {
  //     const observableStub: Observable<any> = fixture.debugElement.injector.get(Observable);
  //     const uploadServiceStub: UploadxService =
  //       fixture.debugElement.injector.get(UploadxService);
  //     spyOn(uploadServiceStub, 'control');
  //     comp.onUpload(observableStub);
  //     expect(uploadServiceStub.control).toHaveBeenCalled();
  //   });
  // });

  describe('cancelAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.cancel();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });

  describe('uploadAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.upload();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });

  describe('pauseAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.pause();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });
});
