import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BurnTokenComponent } from './burn-token.component';

describe('BurnTokenComponent', () => {
  let component: BurnTokenComponent;
  let fixture: ComponentFixture<BurnTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BurnTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BurnTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
