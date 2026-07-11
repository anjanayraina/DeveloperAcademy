// ─── App — root component with state, layout and page routing ─────────────────
import React, { useState, useEffect } from 'react';
import type { NavPage, UserProgress } from './types';
import { fetchProgress } from './api/client';
import { Sidebar } from './components/Layout/Sidebar';
import { Header }  from './components/Layout/Header';
import { RoadmapPage, DashboardPage, MentorPage } from './pages';
import './index.css';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('roadmap');
  const [progress, setProgress]     = useState<UserProgress | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchProgress('demo-user')
      .then(setProgress)
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'roadmap':
        return <RoadmapPage progress={progress} loading={loading} />;
      case 'dashboard':
        return <DashboardPage progress={progress} loading={loading} />;
      case 'mentor':
        return <MentorPage currentLevel={progress?.current_level ?? 1} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <Header
        activePage={activePage}
        xp={progress?.xp ?? 0}
        streak={progress?.streak_days ?? 0}
      />
      <main className="app-main" id="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
