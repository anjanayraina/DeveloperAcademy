// ─── Pages (thin wrappers that compose components into views) ─────────────────
import React from 'react';
import { RoadmapView } from '../components/Roadmap/RoadmapView';
import { Dashboard }   from '../components/Dashboard/Dashboard';
import { ChatInterface } from '../components/AIMentor/ChatInterface';
import type { UserProgress, NavPage } from '../types';

// ── Roadmap Page ──────────────────────────────────────────────────────────────
interface RoadmapPageProps { progress: UserProgress | null; loading: boolean; }
export const RoadmapPage: React.FC<RoadmapPageProps> = ({ progress, loading }) => (
  <RoadmapView progress={progress} loading={loading} />
);

// ── Dashboard Page ────────────────────────────────────────────────────────────
interface DashboardPageProps { progress: UserProgress | null; loading: boolean; }
export const DashboardPage: React.FC<DashboardPageProps> = ({ progress, loading }) => (
  <Dashboard progress={progress} loading={loading} />
);

// ── Mentor Page ───────────────────────────────────────────────────────────────
interface MentorPageProps { currentLevel?: number; }
export const MentorPage: React.FC<MentorPageProps> = ({ currentLevel = 1 }) => {
  const LEVEL_TITLES: Record<number, string> = {
    1: 'Level 1 — Blockchain Fundamentals',
    2: 'Level 2 — Wallet Development',
    3: 'Level 3 — Smart Contract Development',
    4: 'Level 4 — DeFi Fundamentals',
    5: 'Level 5 — DAO Governance',
    6: 'Level 6 — MOR Finance Protocols',
  };
  return (
    <ChatInterface mentorContext={LEVEL_TITLES[currentLevel] ?? 'General Curriculum'} />
  );
};
