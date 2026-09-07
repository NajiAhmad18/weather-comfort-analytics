import React from 'react';
import type { RankedCityWeather } from '../types/weather-api.types';
import { CityCard } from './CityCard';

interface CityRankingGridProps {
  cities: RankedCityWeather[];
}

export const CityRankingGrid: React.FC<CityRankingGridProps> = ({ cities }) => {
  return (
    <div className="city-grid">
      {cities.map((city) => (
        <CityCard key={city.cityCode} city={city} isTopThree={city.rank <= 3} />
      ))}
    </div>
  );
};
