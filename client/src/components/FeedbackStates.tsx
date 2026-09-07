import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="state-container">
      <div className="spinner" />
      <p className="state-text">Loading weather analytics data...</p>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="state-container error-container">
      <div className="error-icon">!</div>
      <h3 className="error-title">Unable to Load Weather Data</h3>
      <p className="state-text">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC = () => {
  return (
    <div className="state-container">
      <p className="state-text">No city weather data available.</p>
    </div>
  );
};

interface PartialFailureNoticeProps {
  errors: Array<{ cityCode: number; cityName: string; error: string }>;
}

export const PartialFailureNotice: React.FC<PartialFailureNoticeProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="partial-failure-notice">
      <span>
        ⚠️ Weather data for {errors.length} {errors.length === 1 ? 'city' : 'cities'} could not be retrieved (
        {errors.map((e) => e.cityName).join(', ')})
      </span>
    </div>
  );
};
