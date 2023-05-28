import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UploadxService } from 'ngx-uploadx';
import { ServiceCodeWayComponent } from './service-code-way.component';

describe('ServiceCodeWayComponent', () => {
  let comp: ServiceCodeWayComponent;
  let fixture: ComponentFixture<ServiceCodeWayComponent>;
  let service: UploadxService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceCodeWayComponent],
      providers: [{ provide: UploadxService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCodeWayComponent);
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
    spyOn(comp, 'getFiles').and.returnValue(dt.files);
    const handleFiles = spyOn(service, 'handleFiles');
    comp.onChange();
    expect(handleFiles).toHaveBeenCalled();
  });
});
