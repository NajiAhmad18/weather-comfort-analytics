import React, { useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Header } from '../components/Header';
import { DashboardSummary } from '../components/DashboardSummary';
import { DashboardControls } from '../components/DashboardControls';
import type { ComfortFilterOption, SortOption } from '../components/DashboardControls';
import { CityRankingGrid } from '../components/CityRankingGrid';
import { EmptyState, ErrorState, LoadingState, PartialFailureNotice } from '../components/FeedbackStates';
import { weatherApiClient } from '../services/weather-api.service';
import type { WeatherRankingResponse } from '../types/weather-api.types';

export const DashboardPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState<WeatherRankingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('comfort-desc');
  const [comfortFilter, setComfortFilter] = useState<ComfortFilterOption>('all');

  const loadData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Retrieve the Auth0 access token. If this fails the request must be
      // aborted — we must NOT call the API without a token.
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
        setError(`Session error: ${message} Please sign in again.`);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const response = await weatherApiClient.fetchRankings(token);
      setData(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load weather data.';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const processedCities = useMemo(() => {
    if (!data || !data.cities) return [];

    let filtered = [...data.cities];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) => c.cityName.toLowerCase().includes(term) || c.country.toLowerCase().includes(term)
      );
    }

    // Comfort score filter
    if (comfortFilter === 'high') {
      filtered = filtered.filter((c) => c.comfortScore >= 80);
    } else if (comfortFilter === 'moderate') {
      filtered = filtered.filter((c) => c.comfortScore >= 60 && c.comfortScore < 80);
    } else if (comfortFilter === 'low') {
      filtered = filtered.filter((c) => c.comfortScore < 60);
    }

    // Sorting (preserves backend-assigned `rank` property)
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

