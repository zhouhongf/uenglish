import { TestBed } from '@angular/core/testing';

import { LocalDBService } from './local-db.service';

describe('LocalDBService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalDBService = TestBed.get(LocalDBService);
    expect(service).toBeTruthy();
  });
});
