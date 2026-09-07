import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Auth0ProviderWithConfig } from './components/Auth0ProviderWithConfig';
import { LoginLanding } from './components/LoginLanding';
import { LoadingState } from './components/FeedbackStates';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: '4rem' }}>
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated && import.meta.env.VITE_AUTH0_DOMAIN) {
    return <LoginLanding />;
  }

  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <Auth0ProviderWithConfig>
      <MainContent />
    </Auth0ProviderWithConfig>
  );
};

export default App;

