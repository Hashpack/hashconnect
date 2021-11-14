import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairingRequestComponent } from './pairing-request.component';

describe('PairingRequestComponent', () => {
  let component: PairingRequestComponent;
  let fixture: ComponentFixture<PairingRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PairingRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
