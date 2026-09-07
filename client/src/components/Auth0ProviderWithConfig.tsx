import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithConfigProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in Auth0Provider using environment-supplied configuration.
 *
 * FAIL CLOSED: all three values (domain, clientId, audience) are required.
 * If any are absent, this component does NOT render children — it renders a
 * configuration error screen instead. The dashboard is never reachable without
 * a fully initialised Auth0 client.
 */
export const Auth0ProviderWithConfig: React.FC<Auth0ProviderWithConfigProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

  if (!domain || !clientId || !audience) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Weather Comfort Analytics
        </h1>
        <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.6 }}>
          Authentication configuration is unavailable. Please configure Auth0
          before accessing the dashboard.
        </p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
};
