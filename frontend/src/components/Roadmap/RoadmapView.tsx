// ─── RoadmapView — 7-level learning roadmap with ecosystem tracks ───────────────
import React, { useState } from 'react';
import type { UserProgress } from '../../types';
import { LevelCard } from './LevelCard';
import { postActiveTrack } from '../../api/client';
import './RoadmapView.css';

interface RoadmapViewProps {
  progress: UserProgress | null;
  loading: boolean;
  onSelectLevel: (levelId: number) => void;
  userId: string;
  token: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
}

const ECOSYSTEMS = [
  { id: 'ethereum', name: 'Ethereum', icon: '🟢', desc: 'Ethereum Architecture, ERC-20, ERC-721, ERC-1155, Account Abstraction, Security, Public Goods' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', desc: 'Arbitrum Nitro Architecture, Orbit L3s, Stylus (Rust), Arbitrum DeFi & Deployments' },
  { id: 'optimism', name: 'Optimism', icon: '🔴', desc: 'OP Stack, Superchain, Governance, Retro Funding, Developer Tooling & Deployments' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', desc: 'Polygon PoS, CDK Framework, zkEVM, Custom Smart Contracts & Consumer dApps' },
  { id: 'base', name: 'Base', icon: '🔷', desc: 'Base Ecosystem, Coinbase Wallet Integrations, Onchain Apps, Base Deployments & Hacks' },
  { id: 'solana', name: 'Solana', icon: '🟠', desc: 'Solana High-Throughput Engine, Accounts Model, Anchor Framework (Rust) & Security' },
  { id: 'avalanche', name: 'Avalanche', icon: '🟤', desc: 'Avalanche Subnet Deployments, Consensus Engine, AVM, Warp Messaging & DeFi' }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  progress,
  loading,
  onSelectLevel,
  userId,
  token,
  onProgressUpdate,
}) => {
  const [switching, setSwitching] = useState(false);

  if (loading) {
    return (
      <div className="roadmap-loading">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" />
        ))}
      </div>
    );
  }

  if (!progress) {
    return <div className="roadmap-error">Failed to load roadmap. Is the backend running?</div>;
  }

  const activeTrackId = progress.active_track || 'ethereum';
  const selectedEco = ECOSYSTEMS.find(e => e.id === activeTrackId) || ECOSYSTEMS[0];

  return (
    <div className="roadmap">
      {/* Hero */}
      <div className="roadmap__hero">
        <h2 className="roadmap__hero-title">
          Your Web3 <span className="gradient-text">Learning Journey</span>
        </h2>
        <p className="roadmap__hero-desc">
          6 progressive levels from blockchain basics to advanced DeFi protocol engineering, followed by your dynamic ecosystem track.
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

      {/* Ecosystem Track Switcher */}
      <div className="roadmap__track-switcher glass animate-fade-up">
        <div className="track-switcher__header">
          <div>
            <h3 className="track-switcher__title">Active Ecosystem Learning Track</h3>
            <p className="track-switcher__subtitle">
              Select an ecosystem track to customize your level 7 curriculum. Currently active: <strong style={{ color: 'var(--clr-primary-light)', textTransform: 'capitalize' }}>{activeTrackId}</strong>
            </p>
          </div>
          {switching && <span className="track-switcher__status">Switching tracks...</span>}
        </div>

        <div className="track-switcher__grid">
          {ECOSYSTEMS.map((eco) => {
            const isActive = activeTrackId === eco.id;
            return (
              <button
                key={eco.id}
                disabled={switching}
                className={`track-btn ${isActive ? 'track-btn--active' : ''}`}
                onClick={async () => {
                  if (isActive) return;
                  try {
                    setSwitching(true);
                    const res = await postActiveTrack(userId, eco.id, token);
                    onProgressUpdate(res);
                  } catch (e) {
                    console.error(e);
                    alert("Error switching track. Check connection.");
                  } finally {
                    setSwitching(false);
                  }
                }}
              >
                <span className="track-btn__icon">{eco.icon}</span>
                <span className="track-btn__name">{eco.name}</span>
                {isActive && <span className="track-btn__badge">ACTIVE</span>}
              </button>
            );
          })}
        </div>

        {/* Selected Track Details */}
        {selectedEco && (
          <div className="track-overview">
            <span className="track-overview__label">Track Curriculum Overview</span>
            <p className="track-overview__desc">{selectedEco.desc}</p>
          </div>
        )}
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
      <div className="roadmap__build-mor glass">
        <h3 className="build-mor__title">Build With MOR</h3>
        <p className="build-mor__desc">
          Explore practical build targets and application blueprints using the MOR Finance developer toolkits.
        </p>
        <div className="build-mor__grid">
          {[
            { title: 'Smart Contracts', icon: '📝' },
            { title: 'dApps Frameworks', icon: '🌐' },
            { title: 'DAO Toolkit', icon: '🏛️' },
            { title: 'Wallet Integrations', icon: '💳' },
            { title: 'AI Agents', icon: '🤖' },
            { title: 'NFT Tooling', icon: '🎨' },
            { title: 'DeFi Projects', icon: '💰' }
          ].map((item) => (
            <div key={item.title} className="build-mor__item">
              <span className="build-mor__item-icon">{item.icon}</span>
              <span className="build-mor__item-title">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
