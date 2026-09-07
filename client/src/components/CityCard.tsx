import React from 'react';
import type { RankedCityWeather } from '../types/weather-api.types';
import { formatWeatherDescription, getComfortCategory } from '../utils/formatters';

interface CityCardProps {
  city: RankedCityWeather;
  isTopThree?: boolean;
}

export const CityCard: React.FC<CityCardProps> = ({ city, isTopThree }) => {
  const category = getComfortCategory(city.comfortScore);

  return (
    <div className={`city-card ${isTopThree ? 'top-three' : ''}`}>
      <div className="city-card-header">
        <div className="city-card-header-left">
          <div className="city-rank-badge">#{city.rank}</div>
          <div className="city-info">
            <h3 className="city-name">{city.cityName}</h3>
            <span className="city-country">{city.country}</span>
          </div>
        </div>
        <div className={`comfort-badge ${category.className}`}>
          {category.label}
        </div>
      </div>

      <div className="city-card-body">
        <div className="comfort-score-container">
          <span className="score-label">Comfort Index</span>
          <div className="score-display">
            <span className="score-value">{city.comfortScore.toFixed(1)}</span>
            <span className="score-max">/100</span>
          </div>
        </div>

        <div className="weather-details-grid">
          <div className="detail-item">
            <span className="detail-label">Condition</span>
            <span className="detail-value">{formatWeatherDescription(city.weatherDescription)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Temperature</span>
            <span className="detail-value">{city.temperature.toFixed(1)}°C</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{city.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">{city.windSpeed.toFixed(1)} m/s</span>
          </div>
        </div>
      </div>

      <div className="city-card-footer">
        <div className="breakdown-metrics">
          <span className="breakdown-metric">Temp {city.comfortBreakdown.temperatureScore}</span>
          <span className="breakdown-divider">·</span>
          <span className="breakdown-metric">Humidity {city.comfortBreakdown.humidityScore}</span>
          <span className="breakdown-divider">·</span>
          <span className="breakdown-metric">Wind {city.comfortBreakdown.windScore}</span>
        </div>
        <span className={`cache-indicator cache-${city.cacheStatus.toLowerCase()}`}>
          <span className="cache-dot"></span> CACHE {city.cacheStatus}
        </span>
      </div>
    </div>
  );
};
