import { ComfortBreakdown } from '../types/comfort.types';
import { clamp } from '../utils/comfort-math.util';

/**
 * Calculates temperature sub-score (0 - 100).
 * Ideal range: 18°C - 24°C (Score 100).
 * Outside range: 8 points lost per °C deviation.
 */
export function calculateTemperatureScore(tempCelsius: number): number {
  if (tempCelsius >= 18 && tempCelsius <= 24) {
    return 100;
  }
  const diff = tempCelsius < 18 ? 18 - tempCelsius : tempCelsius - 24;
  return clamp(100 - diff * 8);
}

/**
 * Calculates humidity sub-score (0 - 100).
 * Ideal range: 40% - 60% (Score 100).
 * Outside range: 2.5 points lost per percentage point deviation.
 */
export function calculateHumidityScore(humidityPercent: number): number {
  if (humidityPercent >= 40 && humidityPercent <= 60) {
    return 100;
  }
  const diff = humidityPercent < 40 ? 40 - humidityPercent : humidityPercent - 60;
  return clamp(100 - diff * 2.5);
}

/**
 * Calculates wind speed sub-score (0 - 100).
 * Ideal range: 1 - 5 m/s (Score 100).
 * Outside range: proportional penalty.
 * Below 1 m/s: 20 points lost per m/s under 1.
 * Above 5 m/s: 15 points lost per m/s over 5.
 */
export function calculateWindScore(windSpeedMs: number): number {
  if (windSpeedMs >= 1 && windSpeedMs <= 5) {
    return 100;
  }
  if (windSpeedMs < 1) {
    const diff = 1 - windSpeedMs;
    return clamp(100 - diff * 20);
  }
  const diff = windSpeedMs - 5;
  return clamp(100 - diff * 15);
}

/**
 * Calculates weighted Comfort Index (0 - 100).
 * Weights: Temperature (50%), Humidity (30%), Wind (20%).
 * Output rounded to 1 decimal place.
 */
export function calculateComfortIndex(
  tempCelsius: number,
  humidityPercent: number,
  windSpeedMs: number
): ComfortBreakdown {
  const tempScore = calculateTemperatureScore(tempCelsius);
  const humidityScore = calculateHumidityScore(humidityPercent);
  const windScore = calculateWindScore(windSpeedMs);

  const rawTotal = tempScore * 0.5 + humidityScore * 0.3 + windScore * 0.2;
  const clampedTotal = clamp(rawTotal, 0, 100);
  const roundedTotal = Math.round(clampedTotal * 10) / 10;

  return {
    temperatureScore: Math.round(tempScore * 10) / 10,
    humidityScore: Math.round(humidityScore * 10) / 10,
    windScore: Math.round(windScore * 10) / 10,
    totalComfortIndex: roundedTotal,
  };
}
