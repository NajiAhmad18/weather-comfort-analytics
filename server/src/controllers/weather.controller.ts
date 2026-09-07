import { Request, Response } from 'express';
import { WeatherAnalyticsService } from '../services/weather-analytics.service';
import { weatherCacheService } from '../services/cache.service';

const analyticsService = new WeatherAnalyticsService();

export async function getWeatherRankingsController(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyticsService.getRankedCityWeather();
    res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage || 'An unexpected error occurred while fetching weather rankings',
    });
  }
}

export function getCacheStatusController(req: Request, res: Response): void {
  try {
    const stats = weatherCacheService.getStats();
    res.status(200).json({
      timestamp: new Date().toISOString(),
      cache: stats,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage || 'Failed to retrieve cache status',
    });
  }
}
