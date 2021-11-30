import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTransactionComponent } from './send-transaction.component';

describe('SendTransactionComponent', () => {
  let component: SendTransactionComponent;
  let fixture: ComponentFixture<SendTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
