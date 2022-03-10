import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartcontractCallComponent } from './smartcontract-call.component';

describe('SmartcontractCallComponent', () => {
  let component: SmartcontractCallComponent;
  let fixture: ComponentFixture<SmartcontractCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartcontractCallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartcontractCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
