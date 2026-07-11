// ─── Dashboard — user progress overview ───────────────────────────────────────
import React from 'react';
import type { UserProgress } from '../../types';
import { LEVEL_COLORS, LEVEL_ICONS } from '../../types';
import { ProgressBar } from './ProgressBar';
import './Dashboard.css';

interface DashboardProps {
  progress: UserProgress | null;
  loading: boolean;
}

const XP_PER_LEVEL = 500;

export const Dashboard: React.FC<DashboardProps> = ({ progress, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" style={{ height: 120 }} />
        ))}
      </div>
    );
  }
  if (!progress) return null;

  const xpToNextLevel = XP_PER_LEVEL - (progress.xp % XP_PER_LEVEL);
  const xpPct = ((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  return (
    <div className="dashboard">
      {/* Top stat cards */}
      <div className="dashboard__stats animate-fade-up">
        <div className="stat-card">
          <div className="stat-card__icon">⚡</div>
          <div className="stat-card__val">{progress.xp.toLocaleString()}</div>
          <div className="stat-card__lbl">Total XP</div>
        </div>
        <div className="stat-card stat-card--streak">
          <div className="stat-card__icon">🔥</div>
          <div className="stat-card__val">{progress.streak_days}</div>
          <div className="stat-card__lbl">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">📚</div>
          <div className="stat-card__val">
            {progress.levels.reduce((a, l) => a + l.completed_lessons, 0)}
          </div>
          <div className="stat-card__lbl">Lessons Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🏆</div>
          <div className="stat-card__val">
            {progress.levels.filter(l => l.completed_lessons >= l.total_lessons).length}
          </div>
          <div className="stat-card__lbl">Levels Cleared</div>
        </div>
      </div>

      {/* XP progress to next level */}
      <div className="dashboard__xp-card animate-fade-up glass">
        <div className="dashboard__xp-header">
          <div>
            <h3 className="dashboard__xp-title">Level {Math.floor(progress.xp / XP_PER_LEVEL) + 1} Progress</h3>
            <p className="dashboard__xp-sub">{xpToNextLevel} XP to next rank</p>
          </div>
          <div className="dashboard__xp-badge">{progress.xp.toLocaleString()} XP</div>
        </div>
        <ProgressBar value={xpPct} color="var(--clr-accent)" height={10} showPct={false} />
      </div>

      {/* Overall course progress */}
      <div className="dashboard__section animate-fade-up">
        <h2 className="dashboard__section-title">Overall Progress</h2>
        <ProgressBar
          value={progress.overall_pct}
          label="Course Completion"
          height={12}
        />
      </div>

      {/* Per-level breakdown */}
      <div className="dashboard__section animate-fade-up">
        <h2 className="dashboard__section-title">Level Breakdown</h2>
        <div className="dashboard__levels">
          {progress.levels.map((level) => {
            const pct = level.total_lessons > 0
              ? (level.completed_lessons / level.total_lessons) * 100
              : 0;
            const color = LEVEL_COLORS[level.level_id];
            return (
              <div key={level.level_id} className="dashboard__level-row">
                <div className="dashboard__level-icon" style={{ background: `${color}22`, borderColor: `${color}44` }}>
                  <span>{level.is_unlocked ? LEVEL_ICONS[level.level_id] : '🔒'}</span>
                </div>
                <div className="dashboard__level-info">
                  <div className="dashboard__level-name">
                    <span>L{level.level_id} — {level.title}</span>
                    <span className="dashboard__level-lessons">
                      {level.completed_lessons}/{level.total_lessons}
                    </span>
                  </div>
                  <ProgressBar value={pct} color={color} height={6} showPct={false} />
                </div>
                <div className="dashboard__level-pct" style={{ color }}>
                  {Math.round(pct)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon placeholders (Ghost architecture) */}
      <div className="dashboard__section animate-fade-up">
        <h2 className="dashboard__section-title">Coming Soon</h2>
        <div className="dashboard__coming-soon">
          {[
            { icon: '📈', label: 'Learning Analytics', desc: 'Detailed insights into your learning patterns and weak topics' },
            { icon: '🏅', label: 'Hackathons',          desc: 'Team up and build real projects for prizes' },
            { icon: '💬', label: 'Community Forum',    desc: 'Ask questions and share knowledge with fellow developers' },
          ].map((f) => (
            <div key={f.label} className="coming-soon-card">
              <span className="coming-soon-card__icon">{f.icon}</span>
              <div>
                <div className="coming-soon-card__label">{f.label}</div>
                <div className="coming-soon-card__desc">{f.desc}</div>
              </div>
              <span className="badge badge--locked">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
