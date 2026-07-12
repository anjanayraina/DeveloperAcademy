// ─── Dashboard — Learning Analytics Hub ──────────────────────────────────────
import React, { useState } from 'react';
import type { UserProgress } from '../../types';
import { ProgressBar } from './ProgressBar';
import { postGithubSync } from '../../api/client';
import './Dashboard.css';

interface DashboardProps {
  progress: UserProgress | null;
  loading: boolean;
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
}

type AnalyticsTab = 'overview' | 'courses' | 'skills';

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  loading,
  userId,
  onProgressUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  
  // GitHub sync states
  const [githubUsername, setGithubUsername] = useState('');
  const [syncing, setSyncing] = useState(false);

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

  const handleSyncGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;
    try {
      setSyncing(true);
      const res = await postGithubSync(userId, githubUsername.trim());
      onProgressUpdate(res.user_progress);
      alert(`GitHub Synced successfully!\nAdded ${res.new_commits_count} commits.\nXP Gained: ${res.xp_gained} XP!`);
    } catch (err) {
      console.error(err);
      alert("Failed to sync GitHub account contributions.");
    } finally {
      setSyncing(false);
    }
  };

  const getRecentActivities = () => {
    const list: { type: string; label: string; date: string }[] = [];
    
    // Parse quiz attempts
    const quizzes = progress.quiz_attempts || [];
    quizzes.slice(-2).forEach(q => {
      list.push({
        type: 'quiz',
        label: `Passed Quiz: Lesson ${q.lesson_id} (Score: ${Math.round(q.score)}%)`,
        date: new Date(q.attempted_at).toLocaleDateString()
      });
    });

    // Parse submissions
    const exercises = progress.exercises_submitted || [];
    exercises.slice(-2).forEach(ex => {
      list.push({
        type: 'exercise',
        label: `Compiled Smart Contract: Lesson ${ex.lesson_id}`,
        date: new Date(ex.submitted_at).toLocaleDateString()
      });
    });

    // Parse commits
    const commits = progress.github_activities || [];
    commits.slice(-2).forEach(c => {
      list.push({
        type: 'commit',
        label: `Pushed Commit: ${c.message}`,
        date: new Date(c.committed_at).toLocaleDateString()
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  };

  return (
    <div className="dashboard">
      {/* Dashboard Sub-Header / Tab Navigation */}
      <div className="dashboard-nav glass">
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab-btn ${activeTab === 'overview' ? 'dashboard-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'courses' ? 'dashboard-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📊 Course Analytics
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'skills' ? 'dashboard-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            🕸️ Skill radar
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-overview animate-fade-up">
          {/* Top Metric Grid */}
          <div className="dashboard__stats">
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
              <div className="stat-card__lbl">Lessons Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🏆</div>
              <div className="stat-card__val">
                {progress.levels.filter(l => l.completed_lessons >= l.total_lessons).length}
              </div>
              <div className="stat-card__lbl">Levels Cleared</div>
            </div>
          </div>

          <div className="analytics-columns">
            {/* Left Column */}
            <div className="analytics-left">
              {/* Learning Progress Line Chart */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Learning Progress</h3>
                <div className="svg-chart-container">
                  <svg className="svg-line-chart" viewBox="0 0 400 160">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--clr-primary)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--clr-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 130 C 80 110, 140 120, 200 80 C 260 40, 320 60, 380 20"
                      fill="none"
                      stroke="var(--clr-primary-light)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 130 C 80 110, 140 120, 200 80 C 260 40, 320 60, 380 20 L 380 150 L 20 150 Z"
                      fill="url(#chart-grad)"
                    />
                    <circle cx="200" cy="80" r="5" fill="white" stroke="var(--clr-primary-light)" strokeWidth="2" />
                    <circle cx="380" cy="20" r="5" fill="white" stroke="var(--clr-primary-light)" strokeWidth="2" />
                    {/* Y Axis Gridlines */}
                    <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.05)" />
                    <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.05)" />
                    <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" />
                  </svg>
                </div>
              </div>

              {/* GitHub Sync panel */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">🐱 Sync GitHub Contributions</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', marginBottom: 16 }}>
                  Link your account to track commits, pulls, and unlock custom XP rewards.
                </p>
                {(progress as any).github_username ? (
                  <div className="github-linked-state">
                    <span className="github-linked-label">Linked Username:</span>
                    <strong className="github-linked-val">@{(progress as any).github_username}</strong>
                    <button className="btn btn--secondary btn--sm" style={{marginLeft: 'auto'}} onClick={() => {
                      setGithubUsername((progress as any).github_username);
                      setSyncing(true);
                      postGithubSync(userId, (progress as any).github_username).then(res => {
                        onProgressUpdate(res.user_progress);
                        alert("Commits synced successfully!");
                      }).catch(e => console.error(e)).finally(() => setSyncing(false));
                    }}>
                      🔄 Re-Sync Commits
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSyncGitHub} className="github-sync-form">
                    <input
                      type="text"
                      placeholder="GitHub Username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="github-sync-input"
                      required
                    />
                    <button type="submit" className="btn btn--primary btn--sm" disabled={syncing}>
                      {syncing ? 'Syncing...' : 'Sync Contributions'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="analytics-right">
              {/* Skills Breakdown */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Skills Breakdown</h3>
                <div className="skills-progress-list">
                  <div className="skill-row">
                    <span className="skill-lbl">Solidity</span>
                    <ProgressBar value={78} color="var(--clr-primary)" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Smart Contracts</span>
                    <ProgressBar value={82} color="#0891b2" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DeFi Protocol</span>
                    <ProgressBar value={65} color="#059669" height={6} showPct={false} />
                    <span className="skill-badge">Intermediate</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Web3.js</span>
                    <ProgressBar value={70} color="#d97706" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity feed */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Recent Activity</h3>
                <div className="activity-feed">
                  {getRecentActivities().length === 0 ? (
                    <p style={{fontSize: '0.8rem', color: 'var(--clr-text-muted)'}}>No recent activity found. Start a lesson to log updates!</p>
                  ) : (
                    getRecentActivities().map((act, idx) => (
                      <div key={idx} className="activity-feed-item">
                        <div className="activity-marker" />
                        <div>
                          <div className="activity-label">{act.label}</div>
                          <div className="activity-date">{act.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="analytics-courses animate-fade-up">
          {/* Metrics grid */}
          <div className="courses-stats-grid">
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Average Quiz Score</span>
              <span className="c-stat-val">91.7%</span>
              <span className="c-stat-trend text--success">↑ +12% from last month</span>
            </div>
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Completion Rate</span>
              <span className="c-stat-val">{progress.overall_pct}%</span>
              <span className="c-stat-trend text--success">↑ +8% from last week</span>
            </div>
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Time Spent Learning</span>
              <span className="c-stat-val">34h</span>
              <span className="c-stat-trend text--success">↑ +10% from last month</span>
            </div>
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Day Streak</span>
              <span className="c-stat-val">{progress.streak_days} days</span>
              <span className="c-stat-trend text--warning">Keep it up! 🔥</span>
            </div>
          </div>

          <div className="analytics-columns">
            <div className="analytics-left">
              {/* Progress Over Time Multi Line SVG Chart */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Progress Over Time</h3>
                <div className="svg-chart-container">
                  <svg className="svg-line-chart" viewBox="0 0 400 160">
                    {/* Line 1 - Quizzes */}
                    <path
                      d="M 20 120 C 80 110, 140 90, 200 60 C 260 50, 320 30, 380 10"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Line 2 - Exercises */}
                    <path
                      d="M 20 140 C 80 130, 140 120, 200 90 C 260 80, 320 50, 380 30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <legend>
                      <circle cx="200" cy="60" r="4" fill="#a855f7" />
                      <circle cx="200" cy="90" r="4" fill="#3b82f6" />
                    </legend>
                  </svg>
                  <div className="chart-legend-labels">
                    <span style={{color: '#a855f7'}}>● Quiz Average</span>
                    <span style={{color: '#3b82f6'}}>● Coding Exercises</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-right">
              {/* Learning Insights */}
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Learning Insights</h3>
                <div className="insights-list">
                  <div className="insight-card">
                    <span className="insight-icon">⏰</span>
                    <div>
                      <div className="insight-name">Best Learning Time</div>
                      <div className="insight-desc">7PM - 10PM (You're most active then!)</div>
                    </div>
                  </div>
                  <div className="insight-card">
                    <span className="insight-icon">🎥</span>
                    <div>
                      <div className="insight-name">Preferred Format</div>
                      <div className="insight-desc">Video Lessons & Sandbox compilations</div>
                    </div>
                  </div>
                  <div className="insight-card">
                    <span className="insight-icon">⚠️</span>
                    <div>
                      <div className="insight-name">Improvement Area</div>
                      <div className="insight-desc">DAO Architectures (Focus more here)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="analytics-skills animate-fade-up">
          <div className="analytics-columns">
            {/* Left Radar Chart */}
            <div className="analytics-left">
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Skills Overview</h3>
                
                {/* SVG Radar Chart (Hexagon) */}
                <div className="radar-chart-container">
                  <svg viewBox="0 0 200 200" className="svg-radar-chart">
                    {/* Background hexagons */}
                    <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <polygon points="100,40 152,70 152,130 100,160 48,130 48,70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <polygon points="100,60 135,80 135,120 100,140 65,120 65,80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    
                    {/* Center lines */}
                    <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(255,255,255,0.04)" />
                    <line x1="100" y1="100" x2="170" y2="60" stroke="rgba(255,255,255,0.04)" />
                    <line x1="100" y1="100" x2="170" y2="140" stroke="rgba(255,255,255,0.04)" />
                    <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(255,255,255,0.04)" />
                    <line x1="100" y1="100" x2="30" y2="140" stroke="rgba(255,255,255,0.04)" />
                    <line x1="100" y1="100" x2="30" y2="60" stroke="rgba(255,255,255,0.04)" />

                    {/* Skill radar filled polygon */}
                    <polygon
                      points="100,32 152,65 142,125 100,145 61,120 48,75"
                      fill="rgba(168, 85, 247, 0.25)"
                      stroke="#c084fc"
                      strokeWidth="2"
                    />

                    {/* Node labels */}
                    <text x="100" y="15" textAnchor="middle" fill="#a6adc8" fontSize="6.5">Solidity</text>
                    <text x="175" y="58" textAnchor="start" fill="#a6adc8" fontSize="6.5">Contracts</text>
                    <text x="175" y="145" textAnchor="start" fill="#a6adc8" fontSize="6.5">DeFi</text>
                    <text x="100" y="190" textAnchor="middle" fill="#a6adc8" fontSize="6.5">Web3.js</text>
                    <text x="25" y="145" textAnchor="end" fill="#a6adc8" fontSize="6.5">Security</text>
                    <text x="25" y="58" textAnchor="end" fill="#a6adc8" fontSize="6.5">DAO</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Skills List */}
            <div className="analytics-right">
              <div className="dashboard-panel glass">
                <h3 className="panel-title">Skill Levels</h3>
                <div className="skills-progress-list">
                  <div className="skill-row">
                    <span className="skill-lbl">Solidity</span>
                    <ProgressBar value={78} color="var(--clr-primary)" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Smart Contracts</span>
                    <ProgressBar value={82} color="#0891b2" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DeFi Protocol</span>
                    <ProgressBar value={65} color="#059669" height={6} showPct={false} />
                    <span className="skill-badge">Intermediate</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Web3.js</span>
                    <ProgressBar value={70} color="#d97706" height={6} showPct={false} />
                    <span className="skill-badge">Advanced</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Security</span>
                    <ProgressBar value={60} color="#dc2626" height={6} showPct={false} />
                    <span className="skill-badge">Intermediate</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DAO Architecture</span>
                    <ProgressBar value={45} color="#475569" height={6} showPct={false} />
                    <span className="skill-badge">Beginner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Course Modules */}
          <div className="dashboard-panel glass recommended-panel">
            <h3 className="panel-title">Recommended for You</h3>
            <div className="recommended-grid">
              <div className="rec-card glass">
                <span className="rec-icon">🛡️</span>
                <h4>Smart Contract Security</h4>
                <p>Improve your security scores by learning audit patterns and reentrancy guards.</p>
                <button className="btn btn--secondary btn--sm rec-btn">Improve Skill</button>
              </div>
              <div className="rec-card glass">
                <span className="rec-icon">💎</span>
                <h4>DeFi AMMs & Yields</h4>
                <p>Deep dive into liquidity provisioning algorithms and AMM math logic.</p>
                <button className="btn btn--secondary btn--sm rec-btn">Start Advanced</button>
              </div>
              <div className="rec-card glass">
                <span className="rec-icon">🏛️</span>
                <h4>DAO Architectures</h4>
                <p>Master multi-sig governance structures and proposals casting validators.</p>
                <button className="btn btn--secondary btn--sm rec-btn">Learn DAO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
