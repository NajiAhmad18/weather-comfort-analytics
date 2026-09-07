import React from 'react';
import { TemperatureTrendChart } from './TemperatureTrendChart';
import type { CityForecastResponse } from '../types/weather-api.types';

interface TemperatureTrendPanelProps {
  forecastData: CityForecastResponse | null;
  isLoading: boolean;
  error: string | null;
  availableCities: Array<{ cityCode: number; cityName: string }>;
  selectedCityCode: number | null;
  onCitySelect: (cityCode: number) => void;
}

export const TemperatureTrendPanel: React.FC<TemperatureTrendPanelProps> = ({
  forecastData,
  isLoading,
  error,
  availableCities,
  selectedCityCode,
  onCitySelect,
}) => {
  return (
    <div className="forecast-panel">
      <div className="forecast-panel-header">
        <div className="forecast-panel-titles">
          <h2 className="forecast-title">Temperature Trend</h2>
          <p className="forecast-subtitle">Next 24 hours &middot; 3-hour forecast</p>
        </div>
        <div className="forecast-panel-actions">
          {forecastData && !isLoading && (
            <span className="forecast-cache-meta">
              Forecast cache &middot; <span className={`cache-text-${forecastData.cacheStatus.toLowerCase()}`}>{forecastData.cacheStatus}</span>
            </span>
          )}
          <div className="select-wrapper">
            <select
              className="controls-select forecast-city-select"
              value={selectedCityCode || ''}
              onChange={(e) => onCitySelect(Number(e.target.value))}
              aria-label="Select city for forecast"
              disabled={isLoading || availableCities.length === 0}
            >
              {availableCities.map((city) => (
                <option key={city.cityCode} value={city.cityCode}>
                  {city.cityName}
                </option>
              ))}
            </select>
            <svg
              className="select-chevron"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="forecast-panel-content">
        {isLoading && (
          <div className="forecast-state">
            <div className="spinner"></div>
            <span className="state-text">Loading forecast...</span>
          </div>
        )}
        {!isLoading && error && (
          <div className="forecast-state error">
            <span className="state-text" style={{ color: 'var(--error-text)' }}>
              {error}
            </span>
          </div>
        )}
        {!isLoading && !error && forecastData && (
          <TemperatureTrendChart points={forecastData.points} cityName={forecastData.cityName} />
        )}
        {!isLoading && !error && !forecastData && (
          <div className="forecast-state">
            <span className="state-text">Select a city to view forecast</span>
          </div>
        )}
      </div>
    </div>
  );
};
