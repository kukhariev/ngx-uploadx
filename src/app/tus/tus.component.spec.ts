import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadxModule } from 'ngx-uploadx';
import { TusComponent } from './tus.component';

describe('TusComponent', () => {
  let comp: TusComponent;
  let fixture: ComponentFixture<TusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadxModule]
    }).compileComponents();
    fixture = TestBed.createComponent(TusComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(comp).toBeTruthy();
  });
});
