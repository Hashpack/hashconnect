import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcsCreateTopicComponent } from './hcs-create-topic.component';

describe('HcsCreateTopicComponent', () => {
  let component: HcsCreateTopicComponent;
  let fixture: ComponentFixture<HcsCreateTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcsCreateTopicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcsCreateTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
