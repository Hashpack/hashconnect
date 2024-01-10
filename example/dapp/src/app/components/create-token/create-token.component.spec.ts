import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTokenComponent } from './create-token.component';

describe('CreateTokenComponent', () => {
  let component: CreateTokenComponent;
  let fixture: ComponentFixture<CreateTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
