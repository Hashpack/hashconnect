import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRecievedComponent } from './transaction-recieved.component';

describe('TransactionRecievedComponent', () => {
  let component: TransactionRecievedComponent;
  let fixture: ComponentFixture<TransactionRecievedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionRecievedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRecievedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
