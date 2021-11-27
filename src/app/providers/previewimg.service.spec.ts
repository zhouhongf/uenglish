import { TestBed } from '@angular/core/testing';

import { PreviewimgService } from './previewimg.service';

describe('PreviewimgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviewimgService = TestBed.get(PreviewimgService);
    expect(service).toBeTruthy();
  });
});
