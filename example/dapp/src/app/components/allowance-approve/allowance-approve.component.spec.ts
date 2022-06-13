import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowanceApproveComponent } from './allowance-approve.component';

describe('AllowanceApproveComponent', () => {
  let component: AllowanceApproveComponent;
  let fixture: ComponentFixture<AllowanceApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllowanceApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowanceApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
