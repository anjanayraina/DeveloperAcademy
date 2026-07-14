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

      {/* Ecosystem Track Switcher */}
      <div className="roadmap__track-switcher glass animate-fade-up" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 11, 23, 0.45)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>Active Ecosystem Learning Track</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', margin: '4px 0 0 0' }}>
              Select an ecosystem track to customize your level 7 curriculum. Currently active: <strong style={{ color: 'var(--clr-primary-light)', textTransform: 'capitalize' }}>{progress.active_track || 'ethereum'}</strong>
            </p>
          </div>
          {switching && <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', animation: 'pulse 1.5s infinite' }}>Switching tracks...</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { id: 'ethereum', name: 'Ethereum', icon: '🟢', desc: 'Ethereum Architecture, ERC-20, ERC-721, ERC-1155, Account Abstraction, Security, Public Goods' },
            { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', desc: 'Arbitrum Nitro Architecture, Orbit L3s, Stylus (Rust), Arbitrum DeFi & Deployments' },
            { id: 'optimism', name: 'Optimism', icon: '🔴', desc: 'OP Stack, Superchain, Governance, Retro Funding, Developer Tooling & Deployments' },
            { id: 'polygon', name: 'Polygon', icon: '🟣', desc: 'Polygon PoS, CDK Framework, zkEVM, Custom Smart Contracts & Consumer dApps' },
            { id: 'base', name: 'Base', icon: '🔷', desc: 'Base Ecosystem, Coinbase Wallet Integrations, Onchain Apps, Base Deployments & Hacks' },
            { id: 'solana', name: 'Solana', icon: '🟠', desc: 'Solana High-Throughput Engine, Accounts Model, Anchor Framework (Rust) & Security' },
            { id: 'avalanche', name: 'Avalanche', icon: '🟤', desc: 'Avalanche Subnet Deployments, Consensus Engine, AVM, Warp Messaging & DeFi' }
          ].map((eco) => {
            const isActive = (progress.active_track || 'ethereum') === eco.id;
            return (
              <button
                key={eco.id}
                disabled={switching}
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
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid var(--clr-primary)' : '1px solid rgba(255,255,255,0.04)',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                  color: isActive ? '#fff' : 'var(--clr-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  opacity: switching ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{eco.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 800 : 600 }}>{eco.name}</span>
                {isActive && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--clr-primary-light)' }}>ACTIVE</span>}
              </button>
            );
          })}
        </div>

        {/* Selected Track Details */}
        {(() => {
          const ecosystems = [
            { id: 'ethereum', name: 'Ethereum', icon: '🟢', desc: 'Ethereum Architecture, ERC-20, ERC-721, ERC-1155, Account Abstraction, Security, Public Goods' },
            { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', desc: 'Arbitrum Nitro Architecture, Orbit L3s, Stylus (Rust), Arbitrum DeFi & Deployments' },
            { id: 'optimism', name: 'Optimism', icon: '🔴', desc: 'OP Stack, Superchain, Governance, Retro Funding, Developer Tooling & Deployments' },
            { id: 'polygon', name: 'Polygon', icon: '🟣', desc: 'Polygon PoS, CDK Framework, zkEVM, Custom Smart Contracts & Consumer dApps' },
            { id: 'base', name: 'Base', icon: '🔷', desc: 'Base Ecosystem, Coinbase Wallet Integrations, Onchain Apps, Base Deployments & Hacks' },
            { id: 'solana', name: 'Solana', icon: '🟠', desc: 'Solana High-Throughput Engine, Accounts Model, Anchor Framework (Rust) & Security' },
            { id: 'avalanche', name: 'Avalanche', icon: '🟤', desc: 'Avalanche Subnet Deployments, Consensus Engine, AVM, Warp Messaging & DeFi' }
          ];
          const selectedEco = ecosystems.find(e => e.id === (progress.active_track || 'ethereum'));
          if (!selectedEco) return null;
          return (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Track Curriculum Overview</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-secondary)', margin: 0, lineHeight: '1.4' }}>{selectedEco.desc}</p>
            </div>
          );
        })()}
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
