import React from 'react';
import { TemperatureTrendChart } from './TemperatureTrendChart';
import { ForecastCitySelect } from './ForecastCitySelect';
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
          <ForecastCitySelect
            cities={availableCities}
            selectedCityCode={selectedCityCode}
            onCitySelect={onCitySelect}
            disabled={isLoading || availableCities.length === 0}
          />
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
