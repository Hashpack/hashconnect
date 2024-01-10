import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenKycGrantComponent } from './token-kyc-grant.component';

describe('TokenKycGrantComponent', () => {
  let component: TokenKycGrantComponent;
  let fixture: ComponentFixture<TokenKycGrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenKycGrantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenKycGrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
