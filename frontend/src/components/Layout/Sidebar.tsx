// ─── Sidebar navigation component ────────────────────────────────────────────
import React from 'react';
import type { NavPage } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const NAV_ITEMS: { id: NavPage; label: string; icon: string; description: string }[] = [
  { id: 'roadmap',   label: 'Learning Roadmap', icon: '🗺️',  description: '6-level curriculum' },
  { id: 'dashboard', label: 'My Dashboard',     icon: '📊',  description: 'Progress & XP' },
  { id: 'mentor',    label: 'AI Mentor',         icon: '🤖',  description: 'Chat with AI' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar glass">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">⬡</div>
        <div>
          <div className="sidebar__logo-title">Developer</div>
          <div className="sidebar__logo-subtitle gradient-text">Academy</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <p className="sidebar__nav-label">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar__nav-item ${activePage === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <div className="sidebar__nav-text">
              <span className="sidebar__nav-name">{item.label}</span>
              <span className="sidebar__nav-desc">{item.description}</span>
            </div>
            {activePage === item.id && <span className="sidebar__nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">DA</div>
          <div>
            <div className="sidebar__username">Demo User</div>
            <div className="sidebar__user-role">Junior Dev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
