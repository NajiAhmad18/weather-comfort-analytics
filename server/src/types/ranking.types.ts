import { ComfortBreakdown } from './comfort.types';

export interface RankedCityWeather {
  rank: number;
  cityCode: number;
  cityName: string;
  country: string;
  weatherDescription: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  comfortScore: number;
  comfortBreakdown: ComfortBreakdown;
  cacheStatus: 'HIT' | 'MISS';
}

export interface WeatherRankingResponse {
  generatedAt: string;
  totalCities: number;
  cities: RankedCityWeather[];
  errors: Array<{ cityCode: number; cityName: string; error: string }>;
}
