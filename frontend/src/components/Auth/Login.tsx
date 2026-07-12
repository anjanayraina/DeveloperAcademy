// ─── Login Screen — premium portal for Developer Academy ─────────────────────
import React from 'react';
import './Login.css';

interface LoginProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  loading: boolean;
}

export const Login: React.FC<LoginProps> = ({
  onLoginGitHub,
  onLoginWallet,
  loading,
}) => {
  return (
    <div className="login-page">
      {/* Background gradients */}
      <div className="login-bg-glow login-bg-glow--1" />
      <div className="login-bg-glow login-bg-glow--2" />

      <div className="login-container glass animate-fade-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon">⬡</div>
          <h1 className="login-logo__title">
            Developer <span className="gradient-text">Academy</span>
          </h1>
        </div>

        <p className="login-subtitle">
          Master peer-to-peer cryptography, HD wallets, Solidity smart contracts, DeFi AMMs, and AI Compute agents.
        </p>

        {loading ? (
          <div className="login-loading">
            <div className="spinner" />
            <p>Verifying authentication credentials...</p>
          </div>
        ) : (
          <div className="login-methods">
            <button className="btn btn--primary login-btn login-btn--wallet" onClick={onLoginWallet}>
              🦊 Connect Web3 Wallet
            </button>
            
            <button className="btn btn--secondary login-btn login-btn--github" onClick={onLoginGitHub}>
              🐱 Continue with GitHub
            </button>
          </div>
        )}

        <div className="login-footer">
          🔒 Secured by ECDSA signatures & GitHub OAuth 2.0
        </div>
      </div>
    </div>
  );
};

export default Login;
