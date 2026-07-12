// ─── App — root component with state, layout, authentication and routing ───
import React, { useState, useEffect } from 'react';
import type { NavPage, UserProgress, Course } from './types';
import { fetchProgress, fetchCourses, authGithub, authWallet } from './api/client';
import { Sidebar } from './components/Layout/Sidebar';
import { Header }  from './components/Layout/Header';
import { RoadmapPage, DashboardPage, MentorPage } from './pages';
import { LessonsList } from './components/Roadmap/LessonsList';
import { LessonView } from './components/Roadmap/LessonView';
import { CertificatesView } from './components/Certificates/CertificatesView';
import { KPIsView } from './components/Dashboard/KPIsView';
import './index.css';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('roadmap');
  
  // Auth state
  const [userId, setUserId] = useState<string>('demo-user');
  const [authType, setAuthType] = useState<'github' | 'wallet' | 'demo' | null>('demo');
  
  // Progress & curriculum states
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Roadmap Drilldown states
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Load curriculum metadata once on mount
  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch progress reactively when user identity changes
  useEffect(() => {
    setLoading(true);
    fetchProgress(userId)
      .then(setProgress)
      .catch((err) => {
        console.error("Error fetching user progress:", err);
        setProgress(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleLoginGitHub = async () => {
    const username = prompt("Enter your GitHub username to connect:");
    if (!username || !username.trim()) return;

    try {
      setLoading(true);
      const resProgress = await authGithub(username.trim());
      setUserId(resProgress.user_id);
      setAuthType('github');
      setProgress(resProgress);
      setSelectedLevel(null);
      setSelectedLessonId(null);
      setActivePage('roadmap');
    } catch (err) {
      console.error(err);
      alert("Failed to authenticate with GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWallet = async () => {
    // Simulate a signature request prompt
    const address = prompt(
      "Enter your Ethereum Wallet Address to connect:",
      "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    );
    if (!address || !address.trim() || !address.startsWith("0x") || address.length !== 42) {
      alert("Invalid Ethereum address format.");
      return;
    }

    try {
      setLoading(true);
      const resProgress = await authWallet(address.trim());
      setUserId(resProgress.user_id);
      setAuthType('wallet');
      setProgress(resProgress);
      setSelectedLevel(null);
      setSelectedLessonId(null);
      setActivePage('roadmap');
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserId('demo-user');
    setAuthType('demo');
    setSelectedLevel(null);
    setSelectedLessonId(null);
    setActivePage('roadmap');
  };

  const handleProgressUpdate = (updatedProgress: UserProgress) => {
    setProgress(updatedProgress);
  };

  const handleNavigate = (page: NavPage) => {
    // Reset drilldowns when navigating to top-level pages
    setSelectedLevel(null);
    setSelectedLessonId(null);
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'roadmap':
        if (selectedLessonId) {
          return (
            <LessonView
              lessonId={selectedLessonId}
              userId={userId}
              onBack={() => setSelectedLessonId(null)}
              onProgressUpdate={handleProgressUpdate}
            />
          );
        }
        if (selectedLevel != null) {
          return (
            <LessonsList
              levelId={selectedLevel}
              courses={courses}
              progress={progress}
              onBack={() => setSelectedLevel(null)}
              onSelectLesson={setSelectedLessonId}
            />
          );
        }
        return (
          <RoadmapPage
            progress={progress}
            loading={loading}
            onSelectLevel={setSelectedLevel}
          />
        );
      case 'dashboard':
        return <DashboardPage progress={progress} loading={loading} />;
      case 'mentor':
        return <MentorPage currentLevel={progress?.current_level ?? 1} userId={userId} />;
      case 'certificates':
        return <CertificatesView userId={userId} />;
      case 'kpis':
        return <KPIsView userId={userId} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        userId={userId}
        authType={authType}
      />
      <Header
        activePage={activePage}
        xp={progress?.xp ?? 0}
        streak={progress?.streak_days ?? 0}
        userId={userId}
        authType={authType}
        onLoginGitHub={handleLoginGitHub}
        onLoginWallet={handleLoginWallet}
        onLogout={handleLogout}
      />
      <main className="app-main" id="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
