import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  const { isAuthenticated, user, logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">Weather Comfort Analytics</h1>
        <p className="header-subtitle">Real-time weather rankings & comfort index assessment across global cities</p>
      </div>

      <div className="header-controls">
        {isAuthenticated && user && (
          <span className="user-email">{user.email || user.name}</span>
        )}
        <div className="header-actions">
          {isAuthenticated && user && (
            <button className="logout-btn" onClick={handleLogout} aria-label="Log out">
              Log out
            </button>
          )}
          {onRefresh && (
            <button
              className="refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh weather data"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh data'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
