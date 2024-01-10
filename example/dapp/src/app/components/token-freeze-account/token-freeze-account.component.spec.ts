import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenFreezeAccountComponent } from './token-freeze-account.component';

describe('TokenFreezeAccountComponent', () => {
  let component: TokenFreezeAccountComponent;
  let fixture: ComponentFixture<TokenFreezeAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenFreezeAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenFreezeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
