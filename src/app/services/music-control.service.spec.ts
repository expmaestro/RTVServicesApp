import { TestBed } from '@angular/core/testing';

import { MusicControlService } from './music-control.service';

describe('MusicControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MusicControlService = TestBed.get(MusicControlService);
    expect(service).toBeTruthy();
  });
});
