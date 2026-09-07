import http from 'http';
import https from 'https';
import { config } from '../config/env.config';
import { CacheService, weatherCacheService } from './cache.service';
import { OpenWeatherForecastResponse, NormalizedForecastResponse, ForecastPoint } from '../types/forecast.types';
import { CityLoaderService } from './city-loader.service';

export class ForecastService {
  private apiKey: string;
  private cache: CacheService;
  private cityLoader: CityLoaderService;

  constructor(cacheService: CacheService = weatherCacheService, cityLoaderService?: CityLoaderService) {
    this.apiKey = config.openWeatherApiKey;
    this.cache = cacheService;
    this.cityLoader = cityLoaderService || new CityLoaderService();
  }

  public async getForecast(cityCode: number): Promise<NormalizedForecastResponse> {
    const cities = this.cityLoader.getCities();
    const city = cities.find((c) => c.cityCode === cityCode);
    if (!city) {
      throw new Error(`City code ${cityCode} is not in the configured list.`);
    }

    const cacheKey = `weather_forecast_${cityCode}`;
    const cachedResult = this.cache.get<OpenWeatherForecastResponse>(cacheKey);

    let rawData: OpenWeatherForecastResponse;
    let cacheStatus: 'HIT' | 'MISS' = cachedResult.status;

    if (cachedResult.data) {
      rawData = cachedResult.data;
    } else {
      if (!this.apiKey) {
        throw new Error('OPENWEATHER_API_KEY environment variable is not configured');
      }

      rawData = await this.fetchFromOpenWeatherApi(cityCode);
      this.cache.set(cacheKey, rawData, 300);
    }

    return this.normalizeForecast(rawData, city.cityCode, city.cityName, cacheStatus, Date.now());
  }

  private fetchFromOpenWeatherApi(cityCode: number): Promise<OpenWeatherForecastResponse> {
    return new Promise((resolve, reject) => {
      const url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityCode}&appid=${this.apiKey}&units=metric`;
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed: OpenWeatherForecastResponse = JSON.parse(data);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse OpenWeatherMap forecast response for city code ${cityCode}`));
            }
          } else {
            // Do NOT leak raw response bodies in errors
            reject(
              new Error(
                `OpenWeatherMap API forecast request failed for city code ${cityCode} with status code ${res.statusCode}`
              )
            );
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Network error requesting OpenWeatherMap forecast for city code ${cityCode}: ${err.message}`));
      });

      req.end();
    });
  }

  public normalizeForecast(
    raw: OpenWeatherForecastResponse,
    cityCode: number,
    cityName: string,
    cacheStatus: 'HIT' | 'MISS',
    nowMs: number
  ): NormalizedForecastResponse {
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const windowEndMs = nowMs + twentyFourHoursMs;

    const points: ForecastPoint[] = [];

    if (raw.list && Array.isArray(raw.list)) {
      for (const item of raw.list) {
        const itemTimeMs = item.dt * 1000;
        if (itemTimeMs >= nowMs && itemTimeMs <= windowEndMs) {
          points.push({
            timestamp: new Date(itemTimeMs).toISOString(),
            temperature: item.main?.temp ?? 0,
          });
        }
      }
    }

    return {
      cityCode,
      cityName,
      generatedAt: new Date(nowMs).toISOString(),
      cacheStatus,
      points,
    };
  }
}
