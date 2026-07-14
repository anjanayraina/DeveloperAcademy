// ─── Header component with authentication integrations ────────────────────────
import React from 'react';
import type { NavPage, UserProgress } from '../../types';
import './Header.css';

interface HeaderProps {
  activePage: NavPage;
  xp: number;
  streak: number;
  userId: string;
  authType: 'github' | 'wallet' | null;
  progress: UserProgress | null;
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  onLogout: () => void;
  onLinkGitHub?: () => void;
  onLinkWallet?: () => void;
}

const PAGE_META: Record<NavPage, { title: string; subtitle: string }> = {
  roadmap:      { title: 'Academy Roadmap',    subtitle: 'Learn and compile smart contracts' },
  dashboard:    { title: 'Learning Analytics', subtitle: 'Track your Web3 progress & stats' },
  forum:        { title: 'Community Forum',    subtitle: 'Ask questions, share knowledge, and help others' },
  hackathons:   { title: 'Web3 Hackathons',    subtitle: 'Build, innovate, and win.' },
  mentor:       { title: 'AI Mentor Workspace',subtitle: 'Get real-time code reviews and support' },
  certificates: { title: 'My Certificates',    subtitle: 'View and export your verified achievements' },
  about:        { title: 'About the Academy',  subtitle: 'Why the Academy exists and how it supports open source' },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  xp,
  streak,
  userId,
  authType,
  progress,
  onLoginGitHub,
  onLoginWallet,
  onLogout,
  onLinkGitHub,
  onLinkWallet,
}) => {
  const { title, subtitle } = PAGE_META[activePage] || { title: 'Academy', subtitle: 'Learn Web3' };

  const formatUser = () => {
    if (authType === 'github') {
      return `@${userId.replace('gh-', '')}`;
    }
    if (authType === 'wallet') {
      const addr = userId.replace('wallet-', '');
      if (addr.startsWith('0x') && addr.length === 42) {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      }
      return addr;
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
          {authType ? (
            <div className="auth-profile">
              <span className="auth-profile__icon">{authType === 'github' ? '🐱' : '🦊'}</span>
              <span className="auth-profile__name" title={userId}>{formatUser()}</span>
              {authType === 'wallet' && !progress?.github_username && (
                <button className="btn btn--secondary btn--xs header-link-btn" onClick={onLinkGitHub} title="Link GitHub account" style={{ fontSize: '0.7rem', padding: '3px 8px', marginLeft: 8 }}>
                  🐱 Link GitHub
                </button>
              )}
              {authType === 'github' && !progress?.wallet_address && (
                <button className="btn btn--secondary btn--xs header-link-btn" onClick={onLinkWallet} title="Link Crypto wallet" style={{ fontSize: '0.7rem', padding: '3px 8px', marginLeft: 8 }}>
                  🦊 Link Wallet
                </button>
              )}
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
