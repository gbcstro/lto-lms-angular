import { of } from 'rxjs';
import { ProfileService } from '../../../../services/profile.service';
import { ContentHoursComponent } from './content-hours.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ContentHoursComponent', () => {
  let component: ContentHoursComponent;
  let fixture: ComponentFixture<ContentHoursComponent>;
  let profileServiceMock: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentHoursComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

