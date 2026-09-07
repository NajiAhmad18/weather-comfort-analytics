import type { CacheStatusResponse, WeatherRankingResponse } from '../types/weather-api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export class WeatherApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public async fetchRankings(): Promise<WeatherRankingResponse> {
    const response = await fetch(`${this.baseUrl}/api/weather/rankings`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch weather rankings (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }

  public async fetchCacheStatus(): Promise<CacheStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/cache/status`);

    if (!response.ok) {
      throw new Error(`Failed to fetch cache status (${response.status})`);
    }

    return response.json();
  }
}

export const weatherApiClient = new WeatherApiClient();
