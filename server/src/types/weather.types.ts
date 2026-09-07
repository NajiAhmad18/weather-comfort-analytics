export interface OpenWeatherApiResponse {
  id: number;
  name: string;
  sys: {
    country: string;
    id?: number;
    type?: number;
    sunrise?: number;
    sunset?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  dt: number;
}

export interface NormalizedWeatherData {
  cityCode: number;
  cityName: string;
  country: string;
  weatherDescription: string;
  temperatureCelsius: number;
  humidity: number;
  windSpeed: number;
  cloudiness: number;
  pressure: number;
  visibility: number;
  fetchedAt: string;
  cacheStatus: 'HIT' | 'MISS';
}
