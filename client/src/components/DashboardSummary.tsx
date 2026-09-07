import React from 'react';

interface DashboardSummaryProps {
  totalCities: number;
  topCityName?: string;
  topComfortScore?: number;
  generatedAt?: string;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalCities,
  topCityName,
  topComfortScore,
  generatedAt,
}) => {
  const formattedTime = generatedAt ? new Date(generatedAt).toLocaleTimeString() : 'N/A';

  return (
    <div className="summary-cards-grid">
      <div className="summary-card">
        <span className="summary-label">Cities Analyzed</span>
        <span className="summary-value">{totalCities}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Most Comfortable</span>
        <span className="summary-value highlight">
          {topCityName ? `${topCityName} (${topComfortScore?.toFixed(1)})` : 'N/A'}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Last Updated</span>
        <span className="summary-value">{formattedTime}</span>
      </div>
    </div>
  );
};
