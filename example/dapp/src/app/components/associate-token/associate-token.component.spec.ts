import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateTokenComponent } from './associate-token.component';

describe('AssociateTokenComponent', () => {
  let component: AssociateTokenComponent;
  let fixture: ComponentFixture<AssociateTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociateTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
