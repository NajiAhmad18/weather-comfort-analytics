import { CityLoaderService } from './city-loader.service';
import { WeatherService } from './weather.service';
import { calculateComfortIndex } from './comfort-index.service';
import { RankedCityWeather, WeatherRankingResponse } from '../types/ranking.types';

export class WeatherAnalyticsService {
  private cityLoader: CityLoaderService;
  private weatherService: WeatherService;

  constructor(
    cityLoader: CityLoaderService = new CityLoaderService(),
    weatherService: WeatherService = new WeatherService()
  ) {
    this.cityLoader = cityLoader;
    this.weatherService = weatherService;
  }

  public async getRankedCityWeather(): Promise<WeatherRankingResponse> {
    const cities = this.cityLoader.getCities();

    const results = await Promise.allSettled(
      cities.map((city) => this.weatherService.fetchCityWeather(city.cityCode, city.cityName))
    );

    const rankedList: Omit<RankedCityWeather, 'rank'>[] = [];
    const errors: Array<{ cityCode: number; cityName: string; error: string }> = [];

    results.forEach((result, index) => {
      const city = cities[index];
      if (result.status === 'fulfilled') {
        const weather = result.value;
        const comfortBreakdown = calculateComfortIndex(
          weather.temperatureCelsius,
          weather.humidity,
          weather.windSpeed,
          weather.visibility
        );

        rankedList.push({
          cityCode: weather.cityCode,
          cityName: weather.cityName,
          country: weather.country,
          weatherDescription: weather.weatherDescription,
          temperature: weather.temperatureCelsius,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          comfortScore: comfortBreakdown.totalComfortIndex,
          comfortBreakdown,
          cacheStatus: weather.cacheStatus,
        });
      } else {
        errors.push({
          cityCode: city.cityCode,
          cityName: city.cityName,
          error: result.reason?.message || 'Failed to fetch weather data',
        });
      }
    });

    // Sort by comfortScore descending; tie-break by cityName ascending
    rankedList.sort((a, b) => {
      if (b.comfortScore !== a.comfortScore) {
        return b.comfortScore - a.comfortScore;
      }
      return a.cityName.localeCompare(b.cityName);
    });

    const finalCities: RankedCityWeather[] = rankedList.map((city, idx) => ({
      rank: idx + 1,
      ...city,
    }));

    return {
      generatedAt: new Date().toISOString(),
      totalCities: finalCities.length,
      cities: finalCities,
      errors,
    };
  }
}
