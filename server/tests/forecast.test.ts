import { ForecastService } from '../src/services/forecast.service';
import { OpenWeatherForecastResponse } from '../src/types/forecast.types';
import { CacheService } from '../src/services/cache.service';
import { CityLoaderService } from '../src/services/city-loader.service';
import { getCityForecastController } from '../src/controllers/weather.controller';

describe('ForecastService', () => {
  let forecastService: ForecastService;
  let cacheService: CacheService;
  let mockCityLoader: jest.Mocked<CityLoaderService>;

  beforeEach(() => {
    cacheService = new CacheService(300);
    mockCityLoader = {
      getCities: jest.fn().mockReturnValue([
        { cityCode: 2643743, cityName: 'London' }
      ])
    } as any;
    forecastService = new ForecastService(cacheService, mockCityLoader);
  });

  describe('normalizeForecast', () => {
    it('should filter points outside the 24 hour window and preserve Celsius', () => {
      const nowMs = 1000000000000; // Sept 9, 2001
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      const rawResponse: OpenWeatherForecastResponse = {
        cod: '200',
        message: 0,
        cnt: 5,
        list: [
          { dt: (nowMs - 3600000) / 1000, main: { temp: 10 } }, // 1 hour ago (exclude)
          { dt: nowMs / 1000, main: { temp: 15 } }, // Now (include)
          { dt: (nowMs + twentyFourHours) / 1000, main: { temp: 20 } }, // exactly +24h (include)
          { dt: (nowMs + twentyFourHours + 3600000) / 1000, main: { temp: 25 } } // +25h (exclude)
        ]
      };

      const result = forecastService.normalizeForecast(rawResponse, 2643743, 'London', 'MISS', nowMs);

      expect(result.cityCode).toBe(2643743);
      expect(result.cityName).toBe('London');
      expect(result.cacheStatus).toBe('MISS');
      expect(result.points.length).toBe(2);
      expect(result.points[0].temperature).toBe(15);
      expect(result.points[1].temperature).toBe(20);
      expect(result.points[0].timestamp).toBe(new Date(nowMs).toISOString());
    });
  });

  describe('Caching behavior', () => {
    it('should hit the upstream API on MISS and return cached data on HIT', async () => {
      let fetchCount = 0;

      class TestForecastService extends ForecastService {
        protected async fetchFromOpenWeatherApi(cityCode: number): Promise<OpenWeatherForecastResponse> {
          fetchCount++;
          return {
            cod: '200',
            message: 0,
            cnt: 1,
            list: [
              { dt: Date.now() / 1000, main: { temp: 20 } }
            ]
          };
        }
      }

      const testCache = new CacheService(300);
      const testService = new TestForecastService(testCache, mockCityLoader);

      const result1 = await testService.getForecast(2643743);
      expect(fetchCount).toBe(1);
      expect(result1.cacheStatus).toBe('MISS');
      expect(result1.points.length).toBe(1);

      const result2 = await testService.getForecast(2643743);
      expect(fetchCount).toBe(1);
      expect(result2.cacheStatus).toBe('HIT');
      expect(result2.points.length).toBe(1);
    });
  });

  describe('getForecast validation', () => {
    it('should throw if city is not configured', async () => {
      await expect(forecastService.getForecast(9999999))
        .rejects
        .toThrow('City code 9999999 is not in the configured list.');
    });
  });

  describe('getCityForecastController validation', () => {
    it('should return 400 for malformed city code', async () => {
      const mockReq = { params: { cityCode: '2643743abc' } } as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getCityForecastController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid city code format',
      });
    });

    it('should return 400 for negative city code', async () => {
      const mockReq = { params: { cityCode: '-123' } } as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getCityForecastController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
