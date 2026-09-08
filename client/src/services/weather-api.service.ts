import type { CacheStatusResponse, WeatherRankingResponse, CityForecastResponse } from '../types/weather-api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export class WeatherApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public async fetchRankings(accessToken?: string): Promise<WeatherRankingResponse> {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/weather/rankings`, { headers });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch weather rankings (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }

  public async fetchCacheStatus(accessToken?: string): Promise<CacheStatusResponse> {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/cache/status`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch cache status (${response.status})`);
    }

    return response.json();
  }

  public async fetchForecast(cityCode: number, accessToken: string): Promise<CityForecastResponse> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`
    };

    const response = await fetch(`${this.baseUrl}/api/weather/forecast/${cityCode}`, { headers });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch weather forecast (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }
}


export const weatherApiClient = new WeatherApiClient();
