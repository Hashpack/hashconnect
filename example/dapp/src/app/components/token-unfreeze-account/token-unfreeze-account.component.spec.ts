import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenUnfreezeAccountComponent } from './token-unfreeze-account.component';

describe('TokenUnfreezeAccountComponent', () => {
  let component: TokenUnfreezeAccountComponent;
  let fixture: ComponentFixture<TokenUnfreezeAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenUnfreezeAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenUnfreezeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
