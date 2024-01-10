import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowanceDeleteComponent } from './allowance-delete.component';

describe('AllowanceDeleteComponent', () => {
  let component: AllowanceDeleteComponent;
  let fixture: ComponentFixture<AllowanceDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllowanceDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowanceDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
