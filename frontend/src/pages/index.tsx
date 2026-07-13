// ─── Pages (thin wrappers that compose components into views) ─────────────────
import React from 'react';
import { RoadmapView } from '../components/Roadmap/RoadmapView';
import { Dashboard }   from '../components/Dashboard/Dashboard';
import { ChatInterface } from '../components/AIMentor/ChatInterface';
import type { UserProgress } from '../types';

// ── Roadmap Page ──────────────────────────────────────────────────────────────
interface RoadmapPageProps {
  progress: UserProgress | null;
  loading: boolean;
  onSelectLevel: (levelId: number) => void;
}
export const RoadmapPage: React.FC<RoadmapPageProps> = ({ progress, loading, onSelectLevel }) => (
  <RoadmapView progress={progress} loading={loading} onSelectLevel={onSelectLevel} />
);

// ── Dashboard Page ────────────────────────────────────────────────────────────
interface DashboardPageProps {
  progress: UserProgress | null;
  loading: boolean;
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
}
export const DashboardPage: React.FC<DashboardPageProps> = ({ progress, loading, userId, onProgressUpdate, token }) => (
  <Dashboard progress={progress} loading={loading} userId={userId} onProgressUpdate={onProgressUpdate} token={token} />
);

// ── Mentor Page ───────────────────────────────────────────────────────────────
interface MentorPageProps { currentLevel?: number; userId: string; }
export const MentorPage: React.FC<MentorPageProps> = ({ currentLevel = 1, userId }) => {
  const LEVEL_TITLES: Record<number, string> = {
    1: 'Level 1 — Blockchain Fundamentals',
    2: 'Level 2 — Wallet Development',
    3: 'Level 3 — Smart Contract Development',
    4: 'Level 4 — DeFi Fundamentals',
    5: 'Level 5 — DAO Governance',
    6: 'Level 6 — MOR Finance Protocols',
  };
  return (
    <ChatInterface mentorContext={LEVEL_TITLES[currentLevel] ?? 'General Curriculum'} userId={userId} />
  );
};
