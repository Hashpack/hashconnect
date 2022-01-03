import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintTokenComponent } from './mint-token.component';

describe('MintTokenComponent', () => {
  let component: MintTokenComponent;
  let fixture: ComponentFixture<MintTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MintTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MintTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
