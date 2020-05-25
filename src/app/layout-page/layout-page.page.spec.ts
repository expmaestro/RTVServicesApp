import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LayoutPagePage } from './layout-page.page';

describe('LayoutPagePage', () => {
  let component: LayoutPagePage;
  let fixture: ComponentFixture<LayoutPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
