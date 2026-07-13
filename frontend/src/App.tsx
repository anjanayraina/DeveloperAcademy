// ─── App — root component with state, layout, authentication and routing ───
import { useState, useEffect } from 'react';
import type { NavPage, UserProgress, Course } from './types';
import { fetchProgress, fetchCourses, authGithub, authWallet, fetchAuthConfig } from './api/client';
import { Sidebar } from './components/Layout/Sidebar';
import { Header }  from './components/Layout/Header';
import { RoadmapPage, DashboardPage, MentorPage } from './pages';
import { LessonsList } from './components/Roadmap/LessonsList';
import { LessonView } from './components/Roadmap/LessonView';
import { CertificatesView } from './components/Certificates/CertificatesView';
import { Login } from './components/Auth/Login';
import { ForumView } from './components/Forum/ForumView';
import { HackathonsView } from './components/Hackathons/HackathonsView';
import './index.css';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('roadmap');
  
  // Helpers to read/write session cookie
  const getSessionCookie = () => {
    const name = "user_session=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const setSessionCookie = (uid: string, type: 'github' | 'wallet' | 'demo') => {
    document.cookie = `user_session=${JSON.stringify({ userId: uid, authType: type })}; path=/; max-age=86400; SameSite=Lax`;
  };

  const deleteSessionCookie = () => {
    document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  };

  // Initialize state from cookie if present
  const initialSession = getSessionCookie();

  // Auth state
  const [userId, setUserId] = useState<string>(initialSession?.userId || '');
  const [authType, setAuthType] = useState<'github' | 'wallet' | null>(initialSession?.authType || null);
  
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
      const session = getSessionCookie();
      if (session && session.authType === 'wallet') {
        // Link GitHub to active wallet user session
        import('./api/client').then(({ linkGithub }) => {
          linkGithub(session.userId, code)
            .then((resProgress) => {
              setUserId(resProgress.user_id);
              setAuthType(session.authType);
              setSessionCookie(resProgress.user_id, session.authType);
              setProgress(resProgress);
              alert("GitHub account linked successfully to your wallet profile!");
            })
            .catch((err) => {
              console.error("Link GitHub error:", err);
              alert(err.message || "Failed to link GitHub to wallet.");
            })
            .finally(() => setLoading(false));
        });
      } else {
        // Standard GitHub Auth
        authGithub(undefined, code)
          .then((resProgress) => {
            setUserId(resProgress.user_id);
            setAuthType('github');
            setSessionCookie(resProgress.user_id, 'github');
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
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }
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
      setSessionCookie(resProgress.user_id, 'github');
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
        setSessionCookie(resProgress.user_id, 'wallet');
        setProgress(resProgress);
        setSelectedLevel(null);
        setSelectedLessonId(null);
        setActivePage('roadmap');
        return;
      } catch (err: any) {
        console.error("Wallet signature auth failed:", err);
        alert(err.message || "Failed to authenticate wallet.");
        return;
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
      setSessionCookie(resProgress.user_id, 'wallet');
      setProgress(resProgress);
      setSelectedLevel(null);
      setSelectedLessonId(null);
      setActivePage('roadmap');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGitHub = async () => {
    try {
      setLoading(true);
      const config = await fetchAuthConfig();
      if (config.github_client_id && config.github_client_id.trim()) {
        // Redirect to GitHub OAuth Authorization Page for linking
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.github_client_id}&redirect_uri=${encodeURIComponent(config.github_redirect_uri)}&scope=user`;
        window.location.href = redirectUrl;
        return;
      }
    } catch (err) {
      console.warn("Could not retrieve public auth config, falling back to mock link:", err);
    } finally {
      setLoading(false);
    }

    const username = prompt("Enter your GitHub username to link (Fallback Mock Mode):");
    if (!username || !username.trim()) return;

    try {
      setLoading(true);
      const { linkGithub } = await import('./api/client');
      const resProgress = await linkGithub(userId, undefined, username.trim());
      setProgress(resProgress);
      alert(`GitHub account @${username.trim()} linked successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to link GitHub to wallet profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWallet = async () => {
    const win = window as any;
    let address = "";
    let signature = "mock_signature";
    let message = `Link wallet to Developer Academy`;

    if (win.ethereum) {
      try {
        setLoading(true);
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        message = `Welcome to Developer Academy!\n\nSign this message to link this wallet address to your profile.\nNonce: ${Math.floor(Math.random() * 1000000)}`;
        signature = await win.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        });
      } catch (err) {
        console.error("Link wallet signature failed, attempting mock link:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!address) {
      const input = prompt(
        "Enter Ethereum Wallet Address to link (Fallback Mock Mode):",
        "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      );
      if (!input || !input.trim() || !input.startsWith("0x") || input.length !== 42) {
        alert("Invalid Ethereum address format.");
        return;
      }
      address = input.trim();
    }

    try {
      setLoading(true);
      const { linkWallet } = await import('./api/client');
      const resProgress = await linkWallet(userId, address, message, signature);
      setProgress(resProgress);
      alert(`Wallet ${address} linked successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to link wallet to GitHub profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    deleteSessionCookie();
    setUserId('');
    setAuthType(null);
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
        return (
          <DashboardPage
            progress={progress}
            loading={loading}
            userId={userId}
            onProgressUpdate={handleProgressUpdate}
          />
        );
      case 'forum':
        return <ForumView userId={userId} />;
      case 'hackathons':
        return <HackathonsView userId={userId} onProgressUpdate={handleProgressUpdate} />;
      case 'mentor':
        return <MentorPage currentLevel={progress?.current_level ?? 1} userId={userId} />;
      case 'certificates':
        return <CertificatesView userId={userId} />;

      default:
        return null;
    }
  };

  if (!authType) {
    return (
      <Login
        onLoginGitHub={handleLoginGitHub}
        onLoginWallet={handleLoginWallet}
        loading={loading}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        userId={userId}
        authType={authType}
        onLogout={handleLogout}
      />
      <Header
        activePage={activePage}
        xp={progress?.xp ?? 0}
        streak={progress?.streak_days ?? 0}
        userId={userId}
        authType={authType}
        progress={progress}
        onLoginGitHub={handleLoginGitHub}
        onLoginWallet={handleLoginWallet}
        onLogout={handleLogout}
        onLinkGitHub={handleLinkGitHub}
        onLinkWallet={handleLinkWallet}
      />
      <main className="app-main" id="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
