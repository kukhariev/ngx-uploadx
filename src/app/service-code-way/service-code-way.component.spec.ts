import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadxService } from '../../uploadx';
import { ServiceCodeWayComponent } from './service-code-way.component';

describe('ServiceWayComponent', () => {
  let comp: ServiceCodeWayComponent;
  let fixture: ComponentFixture<ServiceCodeWayComponent>;

  beforeEach(() => {
    const observableStub = {};
    const uploadServiceStub = {
      init: () => ({}),
      control: () => ({})
    };
    TestBed.configureTestingModule({
      declarations: [ ServiceCodeWayComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Observable, useValue: observableStub },
        { provide: UploadxService, useValue: uploadServiceStub }
      ]
    });
    fixture = TestBed.createComponent(ServiceCodeWayComponent);
    comp = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });

  // xdescribe('onUpload', () => {
  //   it('makes expected calls', () => {
  //     const observableStub: Observable<any> = fixture.debugElement.injector.get(Observable);
  //     const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
  //     spyOn(uploadServiceStub, 'control');
  //     comp.onUpload(observableStub);
  //     expect(uploadServiceStub.control).toHaveBeenCalled();
  //   });
  // });

  describe('cancelAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.cancelAll();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });

  describe('uploadAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.uploadAll();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });

  describe('pauseAll', () => {
    it('makes expected calls', () => {
      const uploadServiceStub: UploadxService = fixture.debugElement.injector.get(UploadxService);
      spyOn(uploadServiceStub, 'control');
      comp.pauseAll();
      expect(uploadServiceStub.control).toHaveBeenCalled();
    });
  });

});
