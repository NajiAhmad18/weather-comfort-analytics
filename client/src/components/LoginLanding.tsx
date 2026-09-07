import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const LoginLanding: React.FC = () => {
  const { loginWithRedirect, error } = useAuth0();

  return (
    <div className="container">
      <div className="login-landing-card">
        <h1 className="login-title">Weather Comfort Analytics</h1>
        <p className="login-subtitle">
          Sign in to view real-time weather comfort rankings and analytics across global cities.
        </p>

        {error && (
          <div className="login-error-notice">
            <span>Authentication could not be completed. Please try again.</span>
          </div>
        )}

        <button
          className="login-primary-btn"
          onClick={() => loginWithRedirect()}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
