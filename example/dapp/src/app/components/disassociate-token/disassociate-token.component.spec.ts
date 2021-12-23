import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisassociateTokenComponent } from './disassociate-token.component';

describe('DisassociateTokenComponent', () => {
  let component: DisassociateTokenComponent;
  let fixture: ComponentFixture<DisassociateTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisassociateTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisassociateTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
