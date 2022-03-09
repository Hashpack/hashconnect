import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcsUpdateTopicComponent } from './hcs-update-topic.component';

describe('HcsUpdateTopicComponent', () => {
  let component: HcsUpdateTopicComponent;
  let fixture: ComponentFixture<HcsUpdateTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcsUpdateTopicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcsUpdateTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
