import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ServicesPagePage } from './services-page.page';

describe('ServicesPagePage', () => {
  let component: ServicesPagePage;
  let fixture: ComponentFixture<ServicesPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
