import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcsSubmitMessageComponent } from './hcs-submit-message.component';

describe('HcsSubmitMessageComponent', () => {
  let component: HcsSubmitMessageComponent;
  let fixture: ComponentFixture<HcsSubmitMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcsSubmitMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcsSubmitMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
