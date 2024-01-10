import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAppendComponent } from './file-append.component';

describe('FileAppendComponent', () => {
  let component: FileAppendComponent;
  let fixture: ComponentFixture<FileAppendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileAppendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileAppendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
