import React from 'react';
import { Header } from '../components/Header';
import { DashboardSummary } from '../components/DashboardSummary';

export const DashboardPage: React.FC = () => {
  return (
    <div className="container">
      <Header />
      <main>
        <DashboardSummary totalCities={0} />
        <section className="ranking-section">
          {/* Main ranking content will be placed here */}
        </section>
      </main>
    </div>
  );
};
