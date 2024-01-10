import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenKycRevokeComponent } from './token-kyc-revoke.component';

describe('TokenKycRevokeComponent', () => {
  let component: TokenKycRevokeComponent;
  let fixture: ComponentFixture<TokenKycRevokeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenKycRevokeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenKycRevokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
