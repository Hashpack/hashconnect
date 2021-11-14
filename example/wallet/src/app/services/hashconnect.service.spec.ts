import { TestBed } from '@angular/core/testing';

import { HashconnectService } from './hashconnect.service';

describe('HashconnectService', () => {
  let service: HashconnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashconnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
