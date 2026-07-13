import React, { useState, useEffect } from 'react';
import type { Hackathon, UserProgress } from '../../types';
import { fetchHackathons, postHackathonRegister, postHackathonSubmit } from '../../api/client';
import './HackathonsView.css';

interface HackathonsViewProps {
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
}

type HackathonSubPage = 'list' | 'detail' | 'submission';
type HackathonTab = 'upcoming' | 'ongoing' | 'completed';
type DetailTab = 'overview' | 'rules' | 'tracks' | 'timeline';

export const HackathonsView: React.FC<HackathonsViewProps> = ({ userId, onProgressUpdate, token }) => {
  const [subPage, setSubPage] = useState<HackathonSubPage>('list');
  const [activeTab, setActiveTab] = useState<HackathonTab>('ongoing');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHack, setSelectedHack] = useState<Hackathon | null>(null);

  // Submission Form State
  const [projName, setProjName] = useState('');
  const [projTagline, setProjTagline] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projVideo, setProjVideo] = useState('');
  const [projCode, setProjCode] = useState('');
  const [teamSize, setTeamSize] = useState(4);

  // Sync hackathons list
  useEffect(() => {
    setLoading(true);
    fetchHackathons(userId)
      .then(setHackathons)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId, subPage]);

  const handleSelectHack = (hack: Hackathon) => {
    setSelectedHack(hack);
    setActiveDetailTab('overview');
    setSubPage('detail');
  };

  const handleRegister = async (e: React.MouseEvent, hackId: string) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const updatedProgress = await postHackathonRegister(hackId, userId, token);
      onProgressUpdate(updatedProgress);
      // Reload hackathons
      const hacks = await fetchHackathons(userId);
      setHackathons(hacks);
      // Update selected
      const freshHack = hacks.find(h => h.hackathon_id === hackId);
      if (freshHack) setSelectedHack(freshHack);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmission = () => {
    if (!selectedHack) return;
    const sub = selectedHack.submission;
    if (sub) {
      setProjName(sub.project_name);
      setProjTagline(sub.tagline);
      setProjDesc(sub.description);
      setProjVideo(sub.video_link);
      setProjCode(sub.code_link);
      setTeamSize(sub.team_size);
    } else {
      setProjName('');
      setProjTagline('');
      setProjDesc('');
      setProjVideo('');
      setProjCode('');
      setTeamSize(4);
    }
    setSubPage('submission');
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHack || !projName.trim() || !projCode.trim()) return;
    try {
      setLoading(true);
      const updatedProgress = await postHackathonSubmit(
        selectedHack.hackathon_id,
        userId,
        projName.trim(),
        projTagline.trim(),
        projDesc.trim(),
        projVideo.trim(),
        projCode.trim(),
        teamSize,
        token
      );
      onProgressUpdate(updatedProgress);
      
      // Reload hackathons
      const hacks = await fetchHackathons(userId);
      setHackathons(hacks);
      const freshHack = hacks.find(h => h.hackathon_id === selectedHack.hackathon_id);
      if (freshHack) setSelectedHack(freshHack);
      
      setSubPage('detail');
      alert("Project submitted successfully! +200 XP gained!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Checklist calculations
  const isNameFilled = projName.trim().length > 0;
  const isTaglineFilled = projTagline.trim().length > 0;
  const isDescFilled = projDesc.trim().length > 0;
  const isVideoFilled = projVideo.trim().length > 0;
  const isCodeFilled = projCode.trim().length > 0;
  
  const checklistCount = [isNameFilled, isTaglineFilled, isDescFilled, isVideoFilled, isCodeFilled].filter(Boolean).length;
  const checklistPct = Math.round((checklistCount / 5) * 100);

  const filteredHacks = hackathons.filter(h => {
    if (activeTab === 'ongoing') return h.status === 'ongoing';
    if (activeTab === 'upcoming') return h.status === 'upcoming';
    return h.status === 'completed';
  });

  return (
    <div className="hackathons-view animate-fade-up">
      {subPage === 'list' && (
        <div className="hacks-layout">
          <div className="hacks-main">
            {/* Header */}
            <div className="hacks-header">
              <div>
                <h2 className="hacks-title">Hackathons</h2>
                <p className="hacks-subtitle">Participate in exciting hackathons, build amazing projects, and turn ideas into impact.</p>
              </div>
            </div>

            {/* Tab navigator */}
            <div className="hacks-tabs-bar glass">
              <div className="hacks-tabs">
                {(['upcoming', 'ongoing', 'completed'] as HackathonTab[]).map((tab) => (
                  <button
                    key={tab}
                    className={`hacks-tab-btn ${activeTab === tab ? 'hacks-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hackathons List */}
            {loading ? (
              <div className="hacks-loading">
                <div className="spinner" />
                <p>Loading hackathons...</p>
              </div>
            ) : filteredHacks.length === 0 ? (
              <div className="hacks-empty glass">
                <p>No hackathons found in this category.</p>
              </div>
            ) : (
              <div className="hacks-list">
                {filteredHacks.map((hack) => (
                  <div key={hack.hackathon_id} className="hack-item glass" onClick={() => handleSelectHack(hack)}>
                    <div className="hack-item__main">
                      <div className="hack-item__title-row">
                        <h4 className="hack-item__title">{hack.title}</h4>
                        {hack.is_registered && <span className="badge badge--success">✓ Registered</span>}
                      </div>
                      <p className="hack-item__desc">{hack.description}</p>
                      
                      <div className="hack-item__meta">
                        <span className="hack-meta-tag">💰 Prize: {hack.prize_pool}</span>
                        <span className="hack-meta-tag">📅 Dates: {hack.start_date} - {hack.end_date}</span>
                      </div>
                    </div>

                    <div className="hack-item__actions">
                      {hack.is_registered ? (
                        <button className="btn btn--secondary btn--sm">
                          View details
                        </button>
                      ) : hack.status === 'upcoming' ? (
                        <button className="btn btn--secondary btn--sm" onClick={(e) => handleRegister(e, hack.hackathon_id)}>
                          Notify Me
                        </button>
                      ) : (
                        <button className="btn btn--primary btn--sm" onClick={(e) => handleRegister(e, hack.hackathon_id)}>
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Panels */}
          <div className="hacks-sidebar">
            {/* Why Join Hackathons */}
            <div className="forum-panel glass">
              <h3 className="forum-panel__title">Why Join Hackathons?</h3>
              <div className="benefits-list">
                <div className="benefit-item">🛠️ <strong>Build real projects</strong> - Turn concepts into code.</div>
                <div className="benefit-item">💡 <strong>Learn new skills</strong> - Work with Morpheus SDKs.</div>
                <div className="benefit-item">🤝 <strong>Network with devs</strong> - Meet other Web3 builders.</div>
                <div className="benefit-item">🏆 <strong>Win amazing prizes</strong> - Huge reward pools!</div>
              </div>
            </div>

            {/* Your Stats */}
            <div className="forum-panel glass">
              <h3 className="forum-panel__title">Your Stats</h3>
              <div className="hacks-stats-grid">
                <div className="hacks-stat-card">
                  <span className="hacks-stat-val">
                    {hackathons.filter(h => h.is_registered).length}
                  </span>
                  <span className="hacks-stat-lbl">Joined</span>
                </div>
                <div className="hacks-stat-card">
                  <span className="hacks-stat-val">
                    {hackathons.filter(h => h.submission).length}
                  </span>
                  <span className="hacks-stat-lbl">Built</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subPage === 'detail' && selectedHack && (
        <div className="hack-detail-container">
          <div className="hack-detail-header-row">
            <button className="btn btn--text back-btn" onClick={() => setSubPage('list')}>
              ← Back to Hackathons
            </button>
          </div>

          <div className="hack-hero-card glass">
            <div className="hack-hero-main">
              <span className="hack-hero-status">Active Hackathon</span>
              <h1 className="hack-detail-title">{selectedHack.title}</h1>
              <p className="hack-detail-desc">{selectedHack.description}</p>
              
              <div className="hack-detail-meta-box">
                <div>
                  <span className="hack-lbl">Prize Pool</span>
                  <span className="hack-val hack-val--prize">{selectedHack.prize_pool}</span>
                </div>
                <div>
                  <span className="hack-lbl">Hackathon Timeline</span>
                  <span className="hack-val">{selectedHack.start_date} to {selectedHack.end_date}</span>
                </div>
              </div>

              <div className="hack-hero-actions">
                {selectedHack.is_registered ? (
                  <button className="btn btn--primary" onClick={handleOpenSubmission}>
                    {selectedHack.submission ? 'Edit Submission' : 'Manage Submission'}
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={(e) => handleRegister(e, selectedHack.hackathon_id)}>
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Menu */}
          <div className="hack-tabs-container glass">
            <div className="hack-detail-tabs">
              {(['overview', 'rules', 'tracks', 'timeline'] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`hack-detail-tab-btn ${activeDetailTab === tab ? 'hack-detail-tab-btn--active' : ''}`}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="hack-detail-tab-body">
              {activeDetailTab === 'overview' && (
                <div>
                  <h3>About the Hackathon</h3>
                  <p>{selectedHack.description}</p>
                  <h4 style={{marginTop: 20}}>Eligibility</h4>
                  <p>All developers, designers, and Web3 enthusiasts globally are eligible to participate. Build apps that leverage decentralized technology!</p>
                </div>
              )}

              {activeDetailTab === 'rules' && (
                <div>
                  <h3>Official Rules</h3>
                  <ul className="hack-list-rules">
                    {selectedHack.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeDetailTab === 'tracks' && (
                <div>
                  <h3>Innovation Tracks</h3>
                  <div className="hack-tracks-grid">
                    {selectedHack.tracks.map((track, idx) => (
                      <div key={idx} className="hack-track-card glass">
                        <h4>{track}</h4>
                        <p>Build solutions targeting the {track} track to be eligible for special category rewards.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'timeline' && (
                <div>
                  <h3>Milestones Timeline</h3>
                  <div className="hack-milestones-timeline">
                    {selectedHack.milestones.map((m, idx) => (
                      <div key={idx} className="hack-milestone-item">
                        <div className="hack-milestone-marker" />
                        <div>
                          <div className="hack-milestone-title">{m.title}</div>
                          <div className="hack-milestone-date">{m.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subPage === 'submission' && selectedHack && (
        <div className="submission-workspace">
          <div className="submission-header-row">
            <button className="btn btn--text back-btn" onClick={() => setSubPage('detail')}>
              ← Back to Details
            </button>
          </div>

          <div className="submission-layout">
            {/* Form */}
            <form onSubmit={handleSubmitProject} className="submission-form glass">
              <h3>My Submission</h3>
              <p className="submission-subtitle">Manage your hackathon project submission.</p>

              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. DeFi Yield Optimizer"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Optimized yield generation protocol for Morpheus users"
                  value={projTagline}
                  onChange={(e) => setProjTagline(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Describe your project, features, and technical architecture..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="form-textarea"
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Video Presentation Link</label>
                <input
                  type="url"
                  placeholder="e.g. YouTube or Loom link"
                  value={projVideo}
                  onChange={(e) => setProjVideo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://github.com/username/project"
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>{s} {s === 1 ? 'member' : 'members'}</option>
                  ))}
                </select>
              </div>

              <div className="create-post-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setSubPage('detail')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {selectedHack.submission ? 'Update Submission' : 'Submit Project'}
                </button>
              </div>
            </form>

            {/* Progress checklist sidebar */}
            <div className="submission-checklist-panel glass">
              <h4>Project Progress</h4>
              <div className="checklist-progress-container">
                <div className="checklist-progress-bar" style={{ width: `${checklistPct}%` }} />
                <span className="checklist-pct-lbl">{checklistPct}% complete</span>
              </div>

              <div className="checklist-items">
                <div className={`checklist-item ${isNameFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isNameFilled ? '✓' : '○'}</span>
                  <span>Project Name added</span>
                </div>
                <div className={`checklist-item ${isTaglineFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isTaglineFilled ? '✓' : '○'}</span>
                  <span>Tagline filled</span>
                </div>
                <div className={`checklist-item ${isDescFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isDescFilled ? '✓' : '○'}</span>
                  <span>Description written</span>
                </div>
                <div className={`checklist-item ${isVideoFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isVideoFilled ? '✓' : '○'}</span>
                  <span>Demo Video linked</span>
                </div>
                <div className={`checklist-item ${isCodeFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isCodeFilled ? '✓' : '○'}</span>
                  <span>GitHub Repository URL added</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonsView;
