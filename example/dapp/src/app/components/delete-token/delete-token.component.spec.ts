import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTokenComponent } from './delete-token.component';

describe('DeleteTokenComponent', () => {
  let component: DeleteTokenComponent;
  let fixture: ComponentFixture<DeleteTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
