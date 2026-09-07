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
    <div className="summary-strip">
      <div className="summary-section">
        <span className="summary-label">Cities Analyzed</span>
        <span className="summary-value">{totalCities}</span>
      </div>
      <div className="summary-divider"></div>
      <div className="summary-section">
        <span className="summary-label">Most Comfortable</span>
        <span className="summary-value">
          {topCityName ? topCityName : 'N/A'}{' '}
          {topComfortScore ? <span className="highlight-score">{topComfortScore.toFixed(1)}</span> : null}
        </span>
      </div>
      <div className="summary-divider"></div>
      <div className="summary-section">
        <span className="summary-label">Last Updated</span>
        <span className="summary-value">{formattedTime}</span>
      </div>
    </div>
  );
};
