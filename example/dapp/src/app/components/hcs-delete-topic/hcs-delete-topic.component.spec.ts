import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcsDeleteTopicComponent } from './hcs-delete-topic.component';

describe('HcsDeleteTopicComponent', () => {
  let component: HcsDeleteTopicComponent;
  let fixture: ComponentFixture<HcsDeleteTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcsDeleteTopicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcsDeleteTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
