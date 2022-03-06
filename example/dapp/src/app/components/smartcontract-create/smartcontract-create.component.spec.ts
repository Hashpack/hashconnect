import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartcontractCreateComponent } from './smartcontract-create.component';

describe('SmartcontractCreateComponent', () => {
  let component: SmartcontractCreateComponent;
  let fixture: ComponentFixture<SmartcontractCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartcontractCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartcontractCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
