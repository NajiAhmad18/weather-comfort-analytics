import {
  calculateComfortIndex,
  calculateHumidityScore,
  calculateTemperatureScore,
  calculateVisibilityScore,
  calculateWindScore,
} from '../src/services/comfort-index.service';
import { clamp } from '../src/utils/comfort-math.util';

describe('Comfort Index Calculation', () => {
  describe('clamp utility', () => {
    it('should clamp values below minimum to min', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('should clamp values above maximum to max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should return value when within bounds', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });
  });

  describe('calculateTemperatureScore', () => {
    it('should return 100 for ideal temperatures (18°C - 24°C)', () => {
      expect(calculateTemperatureScore(18)).toBe(100);
      expect(calculateTemperatureScore(21)).toBe(100);
      expect(calculateTemperatureScore(24)).toBe(100);
    });

    it('should apply penalty for temperatures below 18°C', () => {
      // 17°C is 1°C below ideal -> 100 - 8 = 92
      expect(calculateTemperatureScore(17)).toBe(92);
      // 10°C is 8°C below ideal -> 100 - 64 = 36
      expect(calculateTemperatureScore(10)).toBe(36);
    });

    it('should apply penalty for temperatures above 24°C', () => {
      // 25°C is 1°C above ideal -> 100 - 8 = 92
      expect(calculateTemperatureScore(25)).toBe(92);
      // 30°C is 6°C above ideal -> 100 - 48 = 52
      expect(calculateTemperatureScore(30)).toBe(52);
    });

    it('should clamp temperature score at lower bound 0', () => {
      expect(calculateTemperatureScore(0)).toBe(0);
      expect(calculateTemperatureScore(40)).toBe(0);
    });
  });

  describe('calculateHumidityScore', () => {
    it('should return 100 for ideal humidity (40% - 60%)', () => {
      expect(calculateHumidityScore(40)).toBe(100);
      expect(calculateHumidityScore(50)).toBe(100);
      expect(calculateHumidityScore(60)).toBe(100);
    });

    it('should apply penalty outside ideal range', () => {
      // 30% is 10% below 40% -> 100 - 10 * 2.5 = 75
      expect(calculateHumidityScore(30)).toBe(75);
      // 80% is 20% above 60% -> 100 - 20 * 2.5 = 50
      expect(calculateHumidityScore(80)).toBe(50);
    });

    it('should clamp humidity score at 0', () => {
      expect(calculateHumidityScore(0)).toBe(0);
      expect(calculateHumidityScore(100)).toBe(0);
    });
  });

  describe('calculateWindScore', () => {
    it('should return 100 for ideal wind speed (1 - 5 m/s)', () => {
      expect(calculateWindScore(1)).toBe(100);
      expect(calculateWindScore(3)).toBe(100);
      expect(calculateWindScore(5)).toBe(100);
    });

    it('should apply penalty outside ideal wind speed range', () => {
      // 0 m/s is 1 m/s under 1 -> 100 - 1 * 20 = 80
      expect(calculateWindScore(0)).toBe(80);
      // 7 m/s is 2 m/s over 5 -> 100 - 2 * 15 = 70
      expect(calculateWindScore(7)).toBe(70);
    });

    it('should clamp wind score at 0', () => {
      expect(calculateWindScore(15)).toBe(0);
    });
  });

  describe('calculateVisibilityScore', () => {
    it('should convert visibility to a 0-100 score', () => {
      expect(calculateVisibilityScore(10000)).toBe(100);
      expect(calculateVisibilityScore(5000)).toBe(50);
      expect(calculateVisibilityScore(0)).toBe(0);
    });

    it('should clamp visibility score between 0 and 100', () => {
      expect(calculateVisibilityScore(15000)).toBe(100);
      expect(calculateVisibilityScore(-1000)).toBe(0);
    });
  });

  describe('calculateComfortIndex weighting', () => {
    it('should produce 100 for all ideal parameters', () => {
      const result = calculateComfortIndex(21, 50, 3, 10000);
      expect(result.temperatureScore).toBe(100);
      expect(result.humidityScore).toBe(100);
      expect(result.windScore).toBe(100);
      expect(result.visibilityScore).toBe(100);
      expect(result.totalComfortIndex).toBe(100);
    });

    it('should correctly calculate weighted index with 40/24/16/20 breakdown', () => {
      // Temp: 25°C (Score 92) * 0.4 = 36.8
      // Humidity: 70% (Score 75) * 0.24 = 18
      // Wind: 7 m/s (Score 70) * 0.16 = 11.2
      // Visibility: 10000m (Score 100) * 0.2 = 20
      // Total: 36.8 + 18 + 11.2 + 20 = 86
      const result = calculateComfortIndex(25, 70, 7, 10000);
      expect(result.temperatureScore).toBe(92);
      expect(result.humidityScore).toBe(75);
      expect(result.windScore).toBe(70);
      expect(result.visibilityScore).toBe(100);
      expect(result.totalComfortIndex).toBe(86);
    });

    it('should reduce the Comfort Index when visibility is lower', () => {
      const clearVisibility = calculateComfortIndex(22, 50, 2, 10000);
      const reducedVisibility = calculateComfortIndex(22, 50, 2, 5000);

      expect(clearVisibility.totalComfortIndex).toBe(100);
      expect(reducedVisibility.totalComfortIndex).toBe(90);
    });

    it('should clamp final score between 0 and 100', () => {
      const extremeBad = calculateComfortIndex(50, 100, 20, 0);
      expect(extremeBad.totalComfortIndex).toBe(0);

      const perfect = calculateComfortIndex(22, 50, 2, 10000);
      expect(perfect.totalComfortIndex).toBe(100);
    });
  });
});
