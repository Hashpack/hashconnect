import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInfoRequestComponent } from './account-info-request.component';

describe('AccountInfoRequestComponent', () => {
  let component: AccountInfoRequestComponent;
  let fixture: ComponentFixture<AccountInfoRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountInfoRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountInfoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
