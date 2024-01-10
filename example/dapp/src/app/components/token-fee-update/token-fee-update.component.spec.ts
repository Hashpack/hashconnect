import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenFeeUpdateComponent } from './token-fee-update.component';

describe('TokenFeeUpdateComponent', () => {
  let component: TokenFeeUpdateComponent;
  let fixture: ComponentFixture<TokenFeeUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenFeeUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenFeeUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
