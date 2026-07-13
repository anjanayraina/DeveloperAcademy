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

  // ─── Dynamic Analytics Computations ──────────────────────────────────────────
  
  // Level Percentages (L1 to L6)
  const getLevelPct = (levelId: number) => {
    const lvl = progress.levels.find(l => l.level_id === levelId);
    if (!lvl || lvl.total_lessons === 0) return 0;
    return Math.round((lvl.completed_lessons / lvl.total_lessons) * 100);
  };

  const lvl1 = getLevelPct(1);
  const lvl2 = getLevelPct(2);
  const lvl3 = getLevelPct(3);
  const lvl4 = getLevelPct(4);
  const lvl5 = getLevelPct(5);
  const lvl6 = getLevelPct(6);

  // Skill mappings (weights calculated from lesson levels)
  const soliditySkill = Math.round((lvl2 + lvl3) / 2) || 10;
  const smartContractsSkill = Math.round((lvl2 + lvl3 + lvl5) / 3) || 10;
  const defiSkill = Math.round((lvl4 + lvl5) / 2) || 10;
  const web3Skill = lvl1 || 10;
  const securitySkill = Math.round((lvl3 + lvl6) / 2) || 10;
  const daoSkill = lvl6 || 10;

  const getSkillBadge = (pct: number) => {
    if (pct < 20) return "Beginner";
    if (pct < 50) return "Intermediate";
    if (pct < 80) return "Advanced";
    return "Expert";
  };

  // SVG Radar Chart (Hexagon Vertices Coordinates Generator)
  const getRadarPoint = (angleRad: number, pct: number) => {
    const radius = 10 + (pct / 100) * 70; // Map 0%-100% to radius 10px-80px
    const x = 100 + radius * Math.cos(angleRad);
    const y = 100 + radius * Math.sin(angleRad);
    return `${Math.round(x)},${Math.round(y)}`;
  };

  const p1 = getRadarPoint(-Math.PI / 2, soliditySkill);      // Solidity (top)
  const p2 = getRadarPoint(-Math.PI / 6, smartContractsSkill);  // Smart Contracts
  const p3 = getRadarPoint(Math.PI / 6, defiSkill);            // DeFi
  const p4 = getRadarPoint(Math.PI / 2, web3Skill);            // Web3.js
  const p5 = getRadarPoint(5 * Math.PI / 6, securitySkill);     // Security
  const p6 = getRadarPoint(7 * Math.PI / 6, daoSkill);          // DAO

  const radarPoints = `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;

  // Dynamic Line Chart Path (Calculates cumulative XP growth over time)
  const getDynamicLinePath = () => {
    const attempts = progress.quiz_attempts || [];
    const exercises = progress.exercises_submitted || [];
    const commits = progress.github_activities || [];
    
    const events = [
      ...attempts.map(a => ({ type: 'quiz', date: new Date(a.attempted_at), xp: 50 })),
      ...exercises.map(e => ({ type: 'exercise', date: new Date(e.submitted_at), xp: 100 })),
      ...commits.map(c => ({ type: 'commit', date: new Date(c.committed_at), xp: 20 }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (events.length === 0) {
      return {
        linePath: "M 20 130 C 140 120, 260 110, 380 90",
        areaPath: "M 20 130 C 140 120, 260 110, 380 90 L 380 150 L 20 150 Z"
      };
    }
    
    let currentXp = 0;
    const xpPoints = [{ x: 20, y: 130 }];
    const totalXp = Math.max(100, progress.xp);
    
    events.forEach((ev, idx) => {
      currentXp += ev.xp;
      const x = 20 + ((idx + 1) / events.length) * 360;
      const ratio = Math.min(1, currentXp / totalXp);
      const y = 140 - ratio * 110; // Maps to Y coordinates 140px to 30px
      xpPoints.push({ x, y });
    });
    
    let linePath = `M ${xpPoints[0].x} ${xpPoints[0].y}`;
    for (let i = 1; i < xpPoints.length; i++) {
      linePath += ` L ${Math.round(xpPoints[i].x)} ${Math.round(xpPoints[i].y)}`;
    }
    
    const areaPath = `${linePath} L ${Math.round(xpPoints[xpPoints.length - 1].x)} 150 L 20 150 Z`;
    
    return { linePath, areaPath };
  };

  const { linePath, areaPath } = getDynamicLinePath();

  // Course Stats
  const attempts = progress.quiz_attempts || [];
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, cur) => acc + cur.score, 0) / attempts.length)
    : 0;

  const lessonsCompletedCount = progress.levels.reduce((a, l) => a + l.completed_lessons, 0);
  const quizCount = progress.quiz_attempts?.length || 0;
  const exerciseCount = progress.exercises_submitted?.length || 0;
  
  // Calculate total learning time dynamically based on logs:
  // - 30 minutes per completed lesson
  // - 15 minutes per quiz attempt
  // - 20 minutes per exercise compilation
  const timeSpentMinutes = (lessonsCompletedCount * 30) + (quizCount * 15) + (exerciseCount * 20);
  const timeSpent = Math.round((timeSpentMinutes / 60) * 10) / 10;

  const getLowestProgressLevelName = () => {
    const pcts = [
      { name: "Blockchain Fundamentals (L1)", pct: lvl1 },
      { name: "Solidity Basics (L2)", pct: lvl2 },
      { name: "Solidity Advanced (L3)", pct: lvl3 },
      { name: "DeFi Foundations (L4)", pct: lvl4 },
      { name: "DeFi Advanced (L5)", pct: lvl5 },
      { name: "DAO Foundations (L6)", pct: lvl6 }
    ].filter(item => item.pct < 100);
    
    if (pcts.length === 0) return "None (All Level 6 Mastered!)";
    pcts.sort((a, b) => a.pct - b.pct);
    return pcts[0].name;
  };
  const improvementArea = getLowestProgressLevelName();

  const getBestLearningTime = () => {
    const hours = attempts.map(a => new Date(a.attempted_at).getHours());
    if (hours.length === 0) return "Day Learner: 12PM - 4PM";
    const eveningCount = hours.filter(h => h >= 17).length;
    const morningCount = hours.filter(h => h < 12).length;
    if (eveningCount > morningCount) return "Evening Learner: 6PM - 10PM";
    if (morningCount > eveningCount) return "Early Bird: 8AM - 11AM";
    return "Day Learner: 12PM - 4PM";
  };
  const bestLearningTime = getBestLearningTime();

  // ─── Event handlers ─────────────────────────────────────────────────────────

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
              <div className="stat-card__val">{lessonsCompletedCount}</div>
              <div className="stat-card__lbl">Lessons Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🏆</div>
              <div className="stat-card__val">
                {progress.levels.filter(l => l.completed_lessons >= l.total_lessons && l.total_lessons > 0).length}
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
                      d={linePath}
                      fill="none"
                      stroke="var(--clr-primary-light)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d={areaPath}
                      fill="url(#chart-grad)"
                    />
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
                {progress.github_username ? (
                  <div className="github-linked-state">
                    <span className="github-linked-label">Linked Username:</span>
                    <strong className="github-linked-val">@{progress.github_username}</strong>
                    <button className="btn btn--secondary btn--sm" style={{marginLeft: 'auto'}} onClick={() => {
                      setGithubUsername(progress.github_username || '');
                      setSyncing(true);
                      postGithubSync(userId, progress.github_username || '').then(res => {
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
                    <ProgressBar value={soliditySkill} color="var(--clr-primary)" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(soliditySkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Smart Contracts</span>
                    <ProgressBar value={smartContractsSkill} color="#0891b2" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(smartContractsSkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DeFi Protocol</span>
                    <ProgressBar value={defiSkill} color="#059669" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(defiSkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Web3.js</span>
                    <ProgressBar value={web3Skill} color="#d97706" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(web3Skill)}</span>
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
              <span className="c-stat-val">{avgQuizScore}%</span>
              <span className="c-stat-trend text--success">↑ Based on {attempts.length} attempts</span>
            </div>
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Completion Rate</span>
              <span className="c-stat-val">{progress.overall_pct}%</span>
              <span className="c-stat-trend text--success">Total roadmap percentage</span>
            </div>
            <div className="c-stat-card glass">
              <span className="c-stat-lbl">Time Spent Learning</span>
              <span className="c-stat-val">{timeSpent}h</span>
              <span className="c-stat-trend text--success">Total learning estimation</span>
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
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.05)" />
                    <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.05)" />
                  </svg>
                  <div className="chart-legend-labels">
                    <span style={{color: '#a855f7'}}>● Dynamic XP Progress Path</span>
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
                      <div className="insight-desc">{bestLearningTime}</div>
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
                      <div className="insight-desc">{improvementArea}</div>
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
                      points={radarPoints}
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
                    <ProgressBar value={soliditySkill} color="var(--clr-primary)" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(soliditySkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Smart Contracts</span>
                    <ProgressBar value={smartContractsSkill} color="#0891b2" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(smartContractsSkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DeFi Protocol</span>
                    <ProgressBar value={defiSkill} color="#059669" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(defiSkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Web3.js</span>
                    <ProgressBar value={web3Skill} color="#d97706" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(web3Skill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">Security</span>
                    <ProgressBar value={securitySkill} color="#dc2626" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(securitySkill)}</span>
                  </div>
                  <div className="skill-row">
                    <span className="skill-lbl">DAO Architecture</span>
                    <ProgressBar value={daoSkill} color="#475569" height={6} showPct={false} />
                    <span className="skill-badge">{getSkillBadge(daoSkill)}</span>
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
