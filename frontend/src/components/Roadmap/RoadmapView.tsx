// ─── RoadmapView — 6-level learning roadmap ────────────────────────────────────
import React from 'react';
import type { UserProgress } from '../../types';
import { LevelCard } from './LevelCard';
import './RoadmapView.css';

interface RoadmapViewProps {
  progress: UserProgress | null;
  loading: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ progress, loading }) => {
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
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapView;
