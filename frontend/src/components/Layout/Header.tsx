// ─── Header component ─────────────────────────────────────────────────────────
import React from 'react';
import type { NavPage } from '../../types';
import './Header.css';

interface HeaderProps {
  activePage: NavPage;
  xp: number;
  streak: number;
}

const PAGE_META: Record<NavPage, { title: string; subtitle: string }> = {
  roadmap:   { title: 'Learning Roadmap',    subtitle: 'Your path from zero to Web3 hero' },
  dashboard: { title: 'My Dashboard',         subtitle: 'Track your progress and achievements' },
  mentor:    { title: 'AI Mentor',             subtitle: 'Ask anything — powered by Claude & Hermes' },
};

export const Header: React.FC<HeaderProps> = ({ activePage, xp, streak }) => {
  const { title, subtitle } = PAGE_META[activePage];
  return (
    <header className="header glass">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>
      <div className="header__right">
        <div className="header__stat" title="Current streak">
          <span className="header__stat-icon">🔥</span>
          <span className="header__stat-value">{streak}</span>
          <span className="header__stat-label">day streak</span>
        </div>
        <div className="header__stat header__stat--xp" title="Total XP">
          <span className="header__stat-icon">⚡</span>
          <span className="header__stat-value">{xp.toLocaleString()}</span>
          <span className="header__stat-label">XP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
