export interface OpenWeatherForecastItem {
  dt: number; // Unix timestamp in seconds
  main: {
    temp: number;
  };
}

export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherForecastItem[];
}

export interface ForecastPoint {
  timestamp: string; // ISO-8601 string
  temperature: number; // Celsius
}

export interface NormalizedForecastResponse {
  cityCode: number;
  cityName: string;
  generatedAt: string;
  cacheStatus: 'HIT' | 'MISS';
  points: ForecastPoint[];
}
