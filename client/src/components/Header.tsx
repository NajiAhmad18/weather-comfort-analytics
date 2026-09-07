import React from 'react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">Weather Comfort Analytics</h1>
        <p className="header-subtitle">Real-time weather rankings & comfort index assessment across global cities</p>
      </div>
      {onRefresh && (
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh weather data"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      )}
    </header>
  );
};
