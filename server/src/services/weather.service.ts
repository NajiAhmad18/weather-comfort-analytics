import http from 'http';
import https from 'https';
import { config } from '../config/env.config';
import { CacheService, weatherCacheService } from './cache.service';
import { NormalizedWeatherData, OpenWeatherApiResponse } from '../types/weather.types';

export class WeatherService {
  private apiKey: string;
  private cache: CacheService;

  constructor(cacheService: CacheService = weatherCacheService) {
    this.apiKey = config.openWeatherApiKey;
    this.cache = cacheService;
  }

  public async fetchCityWeather(cityCode: number, cityNameFallback: string): Promise<NormalizedWeatherData> {
    const cacheKey = `weather_raw_${cityCode}`;
    const cachedResult = this.cache.get<OpenWeatherApiResponse>(cacheKey);

    let rawData: OpenWeatherApiResponse;
    let cacheStatus: 'HIT' | 'MISS' = cachedResult.status;

    if (cachedResult.data) {
      rawData = cachedResult.data;
    } else {
      if (!this.apiKey) {
        throw new Error('OPENWEATHER_API_KEY environment variable is not configured');
      }

      rawData = await this.fetchFromOpenWeatherApi(cityCode);
      this.cache.set(cacheKey, rawData);
    }

    return this.normalizeWeatherData(rawData, cityCode, cityNameFallback, cacheStatus);
  }

  private fetchFromOpenWeatherApi(cityCode: number): Promise<OpenWeatherApiResponse> {
    return new Promise((resolve, reject) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${this.apiKey}&units=metric`;

      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed: OpenWeatherApiResponse = JSON.parse(data);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse OpenWeatherMap response for city code ${cityCode}`));
            }
          } else {
            reject(
              new Error(
                `OpenWeatherMap API request failed for city code ${cityCode} with status code ${res.statusCode}: ${data}`
              )
            );
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Network error requesting OpenWeatherMap for city code ${cityCode}: ${err.message}`));
      });

      req.end();
    });
  }

  private normalizeWeatherData(
    raw: OpenWeatherApiResponse,
    fallbackCityCode: number,
    fallbackCityName: string,
    cacheStatus: 'HIT' | 'MISS'
  ): NormalizedWeatherData {
    return {
      cityCode: raw.id || fallbackCityCode,
      cityName: raw.name || fallbackCityName,
      country: raw.sys?.country || '',
      weatherDescription: raw.weather && raw.weather.length > 0 ? raw.weather[0].description : 'unknown',
      temperatureCelsius: raw.main?.temp ?? 0,
      humidity: raw.main?.humidity ?? 0,
      windSpeed: raw.wind?.speed ?? 0,
      cloudiness: raw.clouds?.all ?? 0,
      pressure: raw.main?.pressure ?? 0,
      visibility: raw.visibility ?? 10000,
      fetchedAt: new Date().toISOString(),
      cacheStatus,
    };
  }
}
