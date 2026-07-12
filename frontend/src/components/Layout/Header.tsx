// ─── Header component with authentication integrations ────────────────────────
import React from 'react';
import type { NavPage } from '../../types';
import './Header.css';

interface HeaderProps {
  activePage: NavPage;
  xp: number;
  streak: number;
  userId: string;
  authType: 'github' | 'wallet' | 'demo' | null;
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  onLogout: () => void;
}

const PAGE_META: Record<NavPage, { title: string; subtitle: string }> = {
  roadmap:   { title: 'Learning Roadmap',    subtitle: 'Your path from zero to Web3 hero' },
  dashboard: { title: 'My Dashboard',         subtitle: 'Track your progress and achievements' },
  forum:     { title: 'Community Forum',      subtitle: 'Ask questions, share knowledge, and help others' },
  hackathons: { title: 'Web3 Hackathons',     subtitle: 'Participate, build projects, and win prizes' },
  mentor:    { title: 'AI Mentor',             subtitle: 'Ask anything — powered by Claude & Hermes' },
  certificates: { title: 'My Certificates',   subtitle: 'Verifiable credentials for your Web3 achievements' },
  kpis:      { title: 'Platform Core KPIs',   subtitle: 'Aggregate real-time metrics for Developer Academy' },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  xp,
  streak,
  userId,
  authType,
  onLoginGitHub,
  onLoginWallet,
  onLogout,
}) => {
  const { title, subtitle } = PAGE_META[activePage] || { title: 'Academy', subtitle: 'Learn Web3' };

  const formatUser = () => {
    if (authType === 'github') {
      return `@${userId.replace('gh-', '')}`;
    }
    if (authType === 'wallet') {
      const addr = userId.replace('wallet-', '');
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return 'Demo User';
  };

  return (
    <header className="header glass">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>
      <div className="header__right">
        {/* Auth section */}
        <div className="header__auth">
          {authType && authType !== 'demo' ? (
            <div className="auth-profile">
              <span className="auth-profile__icon">{authType === 'github' ? '🐱' : '🦊'}</span>
              <span className="auth-profile__name" title={userId}>{formatUser()}</span>
              <button className="auth-profile__logout" onClick={onLogout} title="Disconnect session">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn--secondary btn--sm" onClick={onLoginGitHub}>
                🐱 GitHub
              </button>
              <button className="btn btn--primary btn--sm" onClick={onLoginWallet}>
                🦊 Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
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
