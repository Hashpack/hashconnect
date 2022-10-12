import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrngTransactionComponent } from './prng-transaction.component';

describe('PrngTransactionComponent', () => {
  let component: PrngTransactionComponent;
  let fixture: ComponentFixture<PrngTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrngTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrngTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
