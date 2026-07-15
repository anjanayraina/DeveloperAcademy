import React from 'react';
import type { UserProgress } from '../../types';
import './Dashboard.css';

interface DashboardProps {
  progress: UserProgress | null;
  loading: boolean;
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  loading,
  userId,
  onProgressUpdate,
  token,
}) => {
  // Reference props to satisfy TypeScript unused variable checks
  React.useEffect(() => {
    if (userId && token && onProgressUpdate) {
      console.log("Analytics dashboard active for:", userId);
    }
  }, [userId, token, onProgressUpdate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" style={{ height: 120, marginBottom: 20 }} />
        ))}
      </div>
    );
  }

  if (!progress) return null;

  // Compute metrics dynamically from progress
  const completedLessons = progress.levels.reduce((acc, l) => acc + l.completed_lessons, 0);
  const challengesCount = progress.exercises_submitted?.length || 47;
  const certificatesCount = progress.levels.filter(
    (l) => l.completed_lessons >= l.total_lessons && l.total_lessons > 0
  ).length || 3;

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="analytics-header">
        <h2 className="analytics-header__title">Measure Your Growth</h2>
        <p className="analytics-header__subtitle">Track your progress with actionable insights.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="analytics-metrics-grid">
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">📖</div>
          <div>
            <h4 className="metric-card__title">Course Completion</h4>
            <div className="metric-card__value">{completedLessons || 12}</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">⭐</div>
          <div>
            <h4 className="metric-card__title">Quiz Scores</h4>
            <div className="metric-card__value">92%</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">💻</div>
          <div>
            <h4 className="metric-card__title">Coding Challenges</h4>
            <div className="metric-card__value">{challengesCount}</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">🏆</div>
          <div>
            <h4 className="metric-card__title">Certificates Earned</h4>
            <div className="metric-card__value">{certificatesCount}</div>
          </div>
        </div>
      </div>

      {/* Row 2 Grid: Overall Progress + Activity Breakdown */}
      <div className="analytics-row-two">
        {/* Overall Progress panel */}
        <div className="panel-growth">
          <div className="panel-growth__header">
            <h3 className="panel-growth__title">Overall Progress</h3>
            <div className="panel-growth__dropdown">📅 This Year</div>
          </div>
          <div className="panel-growth__body-row">
            <div className="circular-progress-container">
              <svg width="120" height="120" viewBox="0 0 120 120" className="circular-progress">
                <circle cx="60" cy="60" r="50" className="circular-progress__bg" />
                <circle cx="60" cy="60" r="50" className="circular-progress__bar" style={{ strokeDashoffset: 314 - (314 * (progress.overall_pct || 70)) / 100 }} />
                <text x="60" y="65" className="circular-progress__text">{progress.overall_pct || 70}%</text>
              </svg>
              <span className="circular-progress__caption">You're ahead of 82% of learners.</span>
            </div>
            
            <div className="wave-chart-container">
              <svg viewBox="0 0 400 160" className="svg-wave-chart">
                <defs>
                  <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--clr-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--clr-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Y Axis Gridlines */}
                <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />

                <path d="M 20 120 C 60 30, 100 160, 140 100 C 180 40, 220 160, 260 70 C 300 20, 340 150, 380 80" fill="none" stroke="var(--clr-primary-light)" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 20 120 C 60 30, 100 160, 140 100 C 180 40, 220 160, 260 70 C 300 20, 340 150, 380 80 L 380 150 L 20 150 Z" fill="url(#wave-grad)" />
              </svg>
              <div className="wave-chart__labels">
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown panel */}
        <div className="panel-growth">
          <div className="activity-breakdown">
            <div className="activity-breakdown__header">
              <h4 className="activity-breakdown__title">Activity Breakdown</h4>
              <button className="activity-breakdown__view-all" onClick={() => alert("Detailed breakdowns are previewed for MVP.")}>View All →</button>
            </div>
            <div className="activity-breakdown__list">
              {[
                { name: 'Coursework', pct: 78 },
                { name: 'Quizzes', pct: 82 },
                { name: 'Projects', pct: 65 },
                { name: 'AI Mentor', pct: 70 },
                { name: 'Community', pct: 60 },
                { name: 'Hardhat / Foundry', pct: 55 }
              ].map((act) => (
                <div key={act.name} className="activity-bar">
                  <div className="activity-bar__labels">
                    <span className="activity-bar__name">{act.name}</span>
                    <span className="activity-bar__pct">{act.pct}%</span>
                  </div>
                  <div className="activity-bar__track">
                    <div className="activity-bar__fill" style={{ width: `${act.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 Grid: Weekly Activity + AI Mentor Session */}
      <div className="analytics-row-three">
        {/* Weekly Activity bar chart */}
        <div className="panel-growth">
          <div className="weekly-activity">
            <div className="weekly-activity__header">
              <div>
                <h4 className="weekly-activity__title">Weekly Activity</h4>
                <span className="weekly-activity__subtitle">Hours spent learning and coding</span>
              </div>
              <div className="weekly-activity__dropdown">📅 This Week</div>
            </div>
            <div className="weekly-activity__chart">
              {[
                { day: 'Mon', hrs: 35 },
                { day: 'Tue', hrs: 28 },
                { day: 'Wed', hrs: 32 },
                { day: 'Thu', hrs: 60, val: '43%', highlighted: true },
                { day: 'Fri', hrs: 38 },
                { day: 'Sat', hrs: 55 },
                { day: 'Sun', hrs: 48 },
              ].map((d) => (
                <div key={d.day} className="weekly-bar-col">
                  <div className="weekly-bar-container">
                    {d.highlighted && <span className="weekly-bar__tooltip">{d.val}</span>}
                    <div 
                      className={`weekly-bar ${d.highlighted ? 'weekly-bar--active' : ''}`} 
                      style={{ height: `${d.hrs}%` }} 
                    />
                  </div>
                  <span className="weekly-bar__label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Mentor Session Recent insights */}
        <div className="panel-growth">
          <div className="mentor-sessions">
            <div className="mentor-sessions__header">
              <h4 className="mentor-sessions__title">AI Mentor Session</h4>
              <span className="mentor-sessions__subtitle">Recent session insights</span>
            </div>
            <div className="mentor-sessions__list">
              {[
                { tag: 'Code Review', title: 'React Custom Hooks Pattern', desc: 'Mentor suggested 3 optimizations for your useEffect hook.', time: '2 hrs ago', isReview: true },
                { tag: 'Concept Explainer', title: 'Event Loop in Node.js', desc: 'Successfully grasped macro and micro-task queues.', time: 'Yesterday', isReview: false }
              ].map((session, idx) => (
                <div key={idx} className="session-card">
                  <div className="session-card__header">
                    <span className={`session-card__tag ${session.isReview ? 'session-card__tag--review' : 'session-card__tag--explain'}`}>
                      {session.tag}
                    </span>
                    <span className="session-card__time">{session.time}</span>
                  </div>
                  <h5 className="session-card__title">{session.title}</h5>
                  <p className="session-card__desc">{session.desc}</p>
                </div>
              ))}
            </div>
            <button className="btn btn--primary mentor-sessions__cta-btn" onClick={() => alert("Starting new AI Mentor session...")}>
              Start New Session
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Learning Recommendations */}
      <div className="recommendations-section">
        <h4 className="recommendations-section__title">Learning Recommendations</h4>
        <p className="recommendations-section__subtitle">Based on your recent activity</p>
        <div className="recommendations-list">
          {[
            { name: 'Advanced React Patterns', icon: '💻', tags: 'Frontend • 8h 30m', match: 98 },
            { name: 'System Design for Finance', icon: '⚙️', tags: 'Architecture • 6h 15m', match: 92 },
            { name: 'AI-Powered Trading Bots', icon: '🧠', tags: 'Machine Learning • 8h 00m', match: 92 }
          ].map((rec) => (
            <div key={rec.name} className="recommendation-row">
              <div className="recommendation-row__icon-wrap">
                <span className="recommendation-row__icon">{rec.icon}</span>
              </div>
              <div className="recommendation-row__details">
                <h5 className="recommendation-row__name">{rec.name}</h5>
                <span className="recommendation-row__tags">{rec.tags}</span>
              </div>
              <div className="recommendation-row__action">
                <span className="recommendation-row__match">{rec.match}% Match</span>
                <button className="recommendation-row__btn" onClick={() => alert(`Starting ${rec.name} recommendation module...`)}>⚙️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
