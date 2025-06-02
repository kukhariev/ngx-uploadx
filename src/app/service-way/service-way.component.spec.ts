import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UPLOADX_AJAX, UploadxModule } from 'ngx-uploadx';
import { ServiceWayComponent } from './service-way.component';

describe('ServiceWayComponent', () => {
  let comp: ServiceWayComponent;
  let fixture: ComponentFixture<ServiceWayComponent>;

  beforeEach(waitForAsync(() => {
    const mockAjax = {
      request: () => Promise.resolve({ data: '', headers: {}, status: 200 })
    };
    TestBed.configureTestingModule({
      imports: [UploadxModule],
      providers: [{ provide: UPLOADX_AJAX, useValue: mockAjax }]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ServiceWayComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });
});
