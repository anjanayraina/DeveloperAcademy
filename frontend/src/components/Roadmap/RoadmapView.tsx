// ─── RoadmapView — 6-level learning roadmap ────────────────────────────────────
import React from 'react';
import type { UserProgress } from '../../types';
import { LevelCard } from './LevelCard';
import './RoadmapView.css';

interface RoadmapViewProps {
  progress: UserProgress | null;
  loading: boolean;
  onSelectLevel: (levelId: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ progress, loading, onSelectLevel }) => {
  if (loading) {
    return (
      <div className="roadmap-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" />
        ))}
      </div>
    );
  }

  if (!progress) {
    return <div className="roadmap-error">Failed to load roadmap. Is the backend running?</div>;
  }

  return (
    <div className="roadmap">
      {/* Hero */}
      <div className="roadmap__hero">
        <h2 className="roadmap__hero-title">
          Your Web3 <span className="gradient-text">Learning Journey</span>
        </h2>
        <p className="roadmap__hero-desc">
          6 progressive levels from blockchain basics to advanced DeFi protocol engineering.
          Complete each level to unlock the next.
        </p>
        <div className="roadmap__hero-stats">
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">{progress.overall_pct}%</span>
            <span className="roadmap__hero-stat-lbl">Overall Progress</span>
          </div>
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">
              {progress.levels.filter(l => l.completed_lessons >= l.total_lessons).length}
            </span>
            <span className="roadmap__hero-stat-lbl">Levels Complete</span>
          </div>
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">
              {progress.levels.reduce((acc, l) => acc + l.completed_lessons, 0)}
            </span>
            <span className="roadmap__hero-stat-lbl">Lessons Done</span>
          </div>
        </div>
      </div>

      {/* Level cards */}
      <div className="roadmap__levels">
        {progress.levels.map((level, idx) => (
          <LevelCard
            key={level.level_id}
            level={level}
            isLast={idx === progress.levels.length - 1}
            onSelect={() => onSelectLevel(level.level_id)}
          />
        ))}
      </div>

      {/* Build With MOR Section */}
      <div className="roadmap__build-mor glass" style={{ marginTop: '48px', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 11, 23, 0.45)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Build With MOR</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', marginBottom: '24px' }}>
          Explore practical build targets and application blueprints using the MOR Finance developer toolkits.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Smart Contracts', icon: '📝' },
            { title: 'dApps Frameworks', icon: '🌐' },
            { title: 'DAO Toolkit', icon: '🏛️' },
            { title: 'Wallet Integrations', icon: '💳' },
            { title: 'AI Agents', icon: '🤖' },
            { title: 'NFT Tooling', icon: '🎨' },
            { title: 'DeFi Projects', icon: '💰' }
          ].map((item) => (
            <div key={item.title} style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>{item.icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
