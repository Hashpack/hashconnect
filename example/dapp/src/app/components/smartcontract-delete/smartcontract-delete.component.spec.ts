import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartcontractDeleteComponent } from './smartcontract-delete.component';

describe('SmartcontractDeleteComponent', () => {
  let component: SmartcontractDeleteComponent;
  let fixture: ComponentFixture<SmartcontractDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartcontractDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartcontractDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
