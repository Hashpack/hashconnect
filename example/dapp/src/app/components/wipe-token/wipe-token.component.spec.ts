import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WipeTokenComponent } from './wipe-token.component';

describe('WipeTokenComponent', () => {
  let component: WipeTokenComponent;
  let fixture: ComponentFixture<WipeTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WipeTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WipeTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
