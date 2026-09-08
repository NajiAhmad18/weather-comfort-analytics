import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Header } from '../components/Header';
import { DashboardSummary } from '../components/DashboardSummary';
import { DashboardControls } from '../components/DashboardControls';
import type { ComfortFilterOption, SortOption } from '../components/DashboardControls';
import { CityRankingGrid } from '../components/CityRankingGrid';
import { EmptyState, ErrorState, LoadingState, PartialFailureNotice } from '../components/FeedbackStates';
import { weatherApiClient } from '../services/weather-api.service';
import type { WeatherRankingResponse, CityForecastResponse } from '../types/weather-api.types';
import { TemperatureTrendPanel } from '../components/TemperatureTrendPanel';

export const DashboardPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState<WeatherRankingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('comfort-desc');
  const [comfortFilter, setComfortFilter] = useState<ComfortFilterOption>('all');

  const [selectedForecastCityCode, setSelectedForecastCityCode] = useState<number | null>(null);
  const [forecastData, setForecastData] = useState<CityForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const fetchRankingsData = useCallback(async () => {
    let token: string;
    try {
      token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE as string,
        },
      });
    } catch (tokenErr: unknown) {
      const message =
        tokenErr instanceof Error ? tokenErr.message : 'Authentication session error.';
      console.error('Failed to obtain Auth0 access token:', tokenErr);
      throw new Error(`Session error: ${message} Please sign in again.`);
    }
    return await weatherApiClient.fetchRankings(token);
  }, [getAccessTokenSilently]);

  const loadData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetchRankingsData();
      setData(response);
      setSelectedForecastCityCode((prev) =>
        prev === null && response.cities.length > 0 ? response.cities[0].cityCode : prev
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load weather data.';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        const response = await fetchRankingsData();
        if (isMounted) {
          setData(response);
          setError(null);
          setSelectedForecastCityCode((prev) =>
            prev === null && response.cities.length > 0 ? response.cities[0].cityCode : prev
          );
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load weather data.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchRankingsData]);

  // Load forecast data when selected city changes
  useEffect(() => {
    if (!selectedForecastCityCode) return;
    let isMounted = true;

    const loadForecast = async () => {
      setForecastLoading(true);
      setForecastError(null);
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE as string,
          },
        });
        const response = await weatherApiClient.fetchForecast(selectedForecastCityCode, token);
        if (isMounted) {
          setForecastData(response);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load forecast';
          setForecastError(message);
        }
      } finally {
        if (isMounted) {
          setForecastLoading(false);
        }
      }
    };

    loadForecast();
    return () => {
      isMounted = false;
    };
  }, [selectedForecastCityCode, getAccessTokenSilently]);

  const processedCities = useMemo(() => {
    if (!data || !data.cities) return [];

    let filtered = [...data.cities];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) => c.cityName.toLowerCase().includes(term) || c.country.toLowerCase().includes(term)
      );
    }

    if (comfortFilter === 'high') {
      filtered = filtered.filter((c) => c.comfortScore >= 80);
    } else if (comfortFilter === 'moderate') {
      filtered = filtered.filter((c) => c.comfortScore >= 60 && c.comfortScore < 80);
    } else if (comfortFilter === 'low') {
      filtered = filtered.filter((c) => c.comfortScore < 60);
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'comfort-desc':
          return b.comfortScore - a.comfortScore;
        case 'comfort-asc':
          return a.comfortScore - b.comfortScore;
        case 'temp-desc':
          return b.temperature - a.temperature;
        case 'temp-asc':
          return a.temperature - b.temperature;
        case 'name-asc':
          return a.cityName.localeCompare(b.cityName);
        default:
          return a.rank - b.rank;
      }
    });

    return filtered;
  }, [data, searchTerm, sortOption, comfortFilter]);

  const availableForecastCities = useMemo(() => {
    if (!data || !data.cities) return [];
    return data.cities.map(c => ({ cityCode: c.cityCode, cityName: c.cityName }));
  }, [data]);

  const topCity = data?.cities && data.cities.length > 0 ? data.cities[0] : undefined;

  return (
    <div className="container">
      <Header onRefresh={() => loadData(true)} isRefreshing={isRefreshing} />

      <main>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData()} />
        ) : !data || data.cities.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DashboardSummary
              totalCities={data.totalCities}
              topCityName={topCity?.cityName}
              topComfortScore={topCity?.comfortScore}
              generatedAt={data.generatedAt}
            />

            <PartialFailureNotice errors={data.errors} />

            <DashboardControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOption={sortOption}
              onSortChange={setSortOption}
              comfortFilter={comfortFilter}
              onFilterChange={setComfortFilter}
            />

            <TemperatureTrendPanel
              forecastData={forecastData}
              isLoading={forecastLoading}
              error={forecastError}
              availableCities={availableForecastCities}
              selectedCityCode={selectedForecastCityCode}
              onCitySelect={setSelectedForecastCityCode}
            />

            {processedCities.length === 0 ? (
              <div className="state-container">
                <p className="state-text">No cities match your current search or filter criteria.</p>
              </div>
            ) : (
              <CityRankingGrid cities={processedCities} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

