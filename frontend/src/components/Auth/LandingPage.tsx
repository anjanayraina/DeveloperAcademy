import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  loading: boolean;
  error: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginGitHub,
  onLoginWallet,
  loading,
  error,
}) => {
  return (
    <div className="landing-page">
      {/* Background ambient light */}
      <div className="landing-bg-glow" />

      {/* Hero section */}
      <section className="landing-hero animate-fade-up">
        <div className="landing-logo">
          <div className="landing-logo__icon">⬡</div>
          <h1 className="landing-logo__title">
            MOR <span className="gradient-text">FINANCE</span>
          </h1>
        </div>

        <h2 className="landing-hero__title">
          Developer <span className="gradient-text">Academy</span>
        </h2>
        <p className="landing-hero__desc">
          A comprehensive 6-level curriculum and interactive EVM workspace designed to turn programmers into verified smart contract engineers, DeFi builders, and active contributors in the MOR ecosystem.
        </p>

        {loading ? (
          <div className="landing-loading">
            <div className="spinner" />
            <p>Authenticating credentials...</p>
          </div>
        ) : (
          <div className="landing-cta-container">
            <div className="landing-cta-buttons">
              <button className="btn btn--primary landing-login-btn" onClick={onLoginGitHub}>
                🐱 Continue with GitHub
              </button>
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginWallet}>
                🦊 Collect Wallet
              </button>
            </div>
            {error && (
              <div className="landing-error">
                <span>⚠️ {error}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Supported Ecosystems Section */}
      <section className="landing-ecosystems animate-fade-up">
        <h3 className="landing-ecosystems__title">Supported Ecosystems</h3>
        <p className="landing-ecosystems__desc">Build and deploy smart contracts across leading layer-1 and layer-2 blockchains.</p>
        
        <div className="landing-ecosystems-grid">
          {[
            { name: 'Ethereum', desc: 'The foundational Layer 1 network for decentralized smart contracts and Solidity applications.', icon: '🔷' },
            { name: 'Arbitrum', desc: 'Leading optimistic rollup providing ultra-fast execution speed and low fee transactions.', icon: '🌀' },
            { name: 'Optimism', desc: 'Scaling Ethereum via the OP Stack, powering a collective of interoperable superchains.', icon: '🔴' },
            { name: 'Polygon', desc: 'EVM compatible sidechain and aggregates suite supporting custom layer 2 networks.', icon: '💜' },
            { name: 'Base', desc: 'Secure, low-cost, builder-friendly Layer 2 network incubated by Coinbase.', icon: '🔵' },
            { name: 'Avalanche', desc: 'Subnet execution environment designed for custom assets and hyper-scalable dApps.', icon: '🔺' },
            { name: 'Solana', desc: 'High-performance blockchain optimized for sub-second confirmations and Rust programs.', icon: '☀️' }
          ].map((eco) => (
            <div key={eco.name} className="landing-ecosystem-card glass">
              <div className="landing-ecosystem-icon">{eco.icon}</div>
              <h4 className="landing-ecosystem-name">{eco.name}</h4>
              <p className="landing-ecosystem-desc">{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>PROTECTED BY MOR IDENTITY SYSTEM • © 2026 MOR FINANCE</p>
      </footer>
    </div>
  );
};

export default LandingPage;
