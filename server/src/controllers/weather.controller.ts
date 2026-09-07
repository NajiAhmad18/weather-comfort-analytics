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

import { ForecastService } from '../services/forecast.service';
const forecastService = new ForecastService();

export async function getCityForecastController(req: Request, res: Response): Promise<void> {
  try {
    const cityCodeParam = req.params.cityCode;
    const cityCode = parseInt(cityCodeParam, 10);

    if (isNaN(cityCode)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid city code format',
      });
      return;
    }

    const result = await forecastService.getForecast(cityCode);
    res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (errorMessage.includes('not in the configured list')) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Configured city not found',
      });
      return;
    }

    if (errorMessage.includes('OpenWeatherMap API forecast request failed')) {
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Upstream forecast request failed',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Unexpected internal error',
    });
  }
}
