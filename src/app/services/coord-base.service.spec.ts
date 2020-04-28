import { TestBed } from '@angular/core/testing';

import { CoordBaseService } from './coord-base.service';

describe('CoordBaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoordBaseService = TestBed.get(CoordBaseService);
    expect(service).toBeTruthy();
  });
});
