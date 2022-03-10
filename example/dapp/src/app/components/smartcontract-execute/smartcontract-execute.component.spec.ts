import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartcontractExecuteComponent } from './smartcontract-execute.component';

describe('SmartcontractExecuteComponent', () => {
  let component: SmartcontractExecuteComponent;
  let fixture: ComponentFixture<SmartcontractExecuteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartcontractExecuteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartcontractExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
