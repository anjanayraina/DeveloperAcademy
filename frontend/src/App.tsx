// ─── App — root component with state, layout, authentication and routing ───
import React, { useState, useEffect } from 'react';
import type { NavPage, UserProgress, Course } from './types';
import { fetchProgress, fetchCourses, authGithub, authWallet, fetchAuthConfig } from './api/client';
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

  // Check for GitHub OAuth callback code in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Clear URL params immediately to avoid re-triggering exchange
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setLoading(true);
      authGithub(undefined, code)
        .then((resProgress) => {
          setUserId(resProgress.user_id);
          setAuthType('github');
          setProgress(resProgress);
          setSelectedLevel(null);
          setSelectedLessonId(null);
          setActivePage('roadmap');
        })
        .catch((err) => {
          console.error("GitHub OAuth callback error:", err);
          alert("GitHub OAuth authentication failed. Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
        })
        .finally(() => setLoading(false));
    }
  }, []);

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
    try {
      setLoading(true);
      const config = await fetchAuthConfig();
      if (config.github_client_id && config.github_client_id.trim()) {
        // Redirect to GitHub OAuth Authorization Page
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.github_client_id}&redirect_uri=${encodeURIComponent(config.github_redirect_uri)}&scope=user`;
        window.location.href = redirectUrl;
        return;
      }
    } catch (err) {
      console.warn("Could not retrieve public auth config, falling back to mock input:", err);
    } finally {
      setLoading(false);
    }

    // Fallback Mock Login if Client ID is not configured
    const username = prompt("Enter your GitHub username to connect (Fallback Mock Mode):");
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
    const win = window as any;
    if (win.ethereum) {
      try {
        setLoading(true);
        // 1. Request Account Access
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        // 2. Generate Authentication Message with Nonce
        const message = `Welcome to Developer Academy!\n\nSign this message to authenticate your wallet session.\nNonce: ${Math.floor(Math.random() * 1000000)}`;
        
        // 3. Request Cryptographic Signature
        const signature = await win.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        });
        
        // 4. Submit to Backend for Cryptographic Verification
        const resProgress = await authWallet(address, message, signature);
        setUserId(resProgress.user_id);
        setAuthType('wallet');
        setProgress(resProgress);
        setSelectedLevel(null);
        setSelectedLessonId(null);
        setActivePage('roadmap');
        return;
      } catch (err) {
        console.error("Wallet signature auth failed, attempting fallback connection:", err);
      } finally {
        setLoading(false);
      }
    }

    // Fallback Mock Login if no window.ethereum wallet is present or if user cancels signature
    const address = prompt(
      "Enter your Ethereum Wallet Address to connect (Fallback Mock Mode):",
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
