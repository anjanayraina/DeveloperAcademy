import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  onLoginEmail: (email: string) => void;
  error: string | null;
  loading: boolean;
}

export const Login: React.FC<LoginProps> = ({
  onLoginGitHub,
  onLoginWallet,
  onLoginEmail,
  error,
  loading,
}) => {
  const [email, setEmail] = useState('');

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) onLoginEmail(email.trim());
              }}
              className="login-email-form"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-email-input"
                required
              />
              <button type="submit" className="btn btn--primary login-btn login-btn--email">
                ✉️ Continue with Email
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button className="btn btn--primary login-btn login-btn--wallet" style={{ background: '#2563eb' }} onClick={onLoginWallet}>
              🦊 Connect Web3 Wallet
            </button>
            
            <button className="btn btn--secondary login-btn login-btn--github" onClick={onLoginGitHub}>
              🐱 Continue with GitHub
            </button>

            {error && (
              <div className="login-error-banner animate-fade-up">
                <span className="login-error-banner__icon">⚠️</span>
                <span className="login-error-banner__text">{error}</span>
              </div>
            )}
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
