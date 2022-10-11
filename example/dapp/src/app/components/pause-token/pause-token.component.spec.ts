import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseTokenComponent } from './pause-token.component';

describe('PauseTokenComponent', () => {
  let component: PauseTokenComponent;
  let fixture: ComponentFixture<PauseTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PauseTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
