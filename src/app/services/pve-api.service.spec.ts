import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PveApiService } from './pve-api.service';
import { environment } from '../../environments/environment';

describe('PveApiService', () => {
  let service: PveApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + 'characters/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PveApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacterAchievements', () => {
    it('should fetch paginated character achievements with defaults', () => {
      const mockResponse = { data: [], total: 0, page: 1, limit: 25 };

      service.getCharacterAchievements().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}character_achievement?page=1&limit=25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch with custom page and limit', () => {
      const mockResponse = { data: [], total: 50, page: 3, limit: 10 };

      service.getCharacterAchievements(3, 10).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}character_achievement?page=3&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCharacter', () => {
    it('should fetch a single character by ID', () => {
      const mockChar = { guid: 1, name: 'Test', race: 1, class: 1, level: 80, gender: 0 };

      service.getCharacter(1).subscribe((res) => {
        expect(res).toEqual(mockChar);
      });

      const req = httpMock.expectOne(`${baseUrl}1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockChar);
    });
  });

  describe('getAchievementCategories', () => {
    it('should fetch all achievement categories', () => {
      const mockCategories = [{ ID: 1, Name: 'General', ParentID: -1 }];

      service.getAchievementCategories().subscribe((res) => {
        expect(res).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(`${baseUrl}achievement_category`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('getAchievementCategory', () => {
    it('should fetch a single achievement category by ID', () => {
      const mockCategory = { ID: 92, Name: 'General', ParentID: -1 };

      service.getAchievementCategory(92).subscribe((res) => {
        expect(res).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(`${baseUrl}achievement_category/92`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('getCharacterAchievementsByCategory', () => {
    it('should fetch character achievements for a category', () => {
      const mockAchs = [{ achievement: 1, date: 1234567890 }];

      service.getCharacterAchievementsByCategory(5, 92).subscribe((res) => {
        expect(res).toEqual(mockAchs);
      });

      const req = httpMock.expectOne(`${baseUrl}character_achievement/5?category=92`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAchs);
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should fetch achievements for a category without faction', () => {
      const mockAchs = [{ ID: 1, Name: 'Test', Description: '', Points: 10, icon: 'test', Quantity: 0 }];

      service.getAchievementsByCategory(92).subscribe((res) => {
        expect(res).toEqual(mockAchs);
      });

      const req = httpMock.expectOne(`${baseUrl}achievement?category=92`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAchs);
    });

    it('should include faction parameter when provided', () => {
      service.getAchievementsByCategory(92, 'alliance').subscribe();

      const req = httpMock.expectOne(`${baseUrl}achievement?category=92&faction=alliance`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getAchievementProgress', () => {
    it('should fetch achievement progress for a character and category', () => {
      const mockProgress = [{ achievement: 1, counter: 50 }];

      service.getAchievementProgress(5, 130).subscribe((res) => {
        expect(res).toEqual(mockProgress);
      });

      const req = httpMock.expectOne(`${baseUrl}achievement_progress?guid=5&category=130`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgress);
    });
  });

  describe('getAllCharacterAchievements', () => {
    it('should fetch all earned achievements for a character', () => {
      const mockAchs = [{ achievement: 1, date: 1234567890 }];

      service.getAllCharacterAchievements(5).subscribe((res) => {
        expect(res).toEqual(mockAchs);
      });

      const req = httpMock.expectOne(`${baseUrl}character_achievement/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAchs);
    });
  });

  describe('getAllAchievements', () => {
    it('should fetch all achievements without faction', () => {
      service.getAllAchievements().subscribe();

      const req = httpMock.expectOne(`${baseUrl}achievement`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should include faction parameter when provided', () => {
      service.getAllAchievements('alliance').subscribe();

      const req = httpMock.expectOne(`${baseUrl}achievement?faction=alliance`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
