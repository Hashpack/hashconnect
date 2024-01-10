import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpauseTokenComponent } from './unpause-token.component';

describe('UnpauseTokenComponent', () => {
  let component: UnpauseTokenComponent;
  let fixture: ComponentFixture<UnpauseTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnpauseTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpauseTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
