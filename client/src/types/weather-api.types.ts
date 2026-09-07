export interface ComfortBreakdown {
  temperatureScore: number;
  humidityScore: number;
  windScore: number;
  totalComfortIndex: number;
}

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

export interface CacheStats {
  hits: number;
  misses: number;
  keysCount: number;
  ttlSeconds: number;
}

export interface CacheStatusResponse {
  timestamp: string;
  cache: CacheStats;
}
