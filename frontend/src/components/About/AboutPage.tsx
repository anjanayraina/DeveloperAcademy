import React from 'react';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page glass animate-fade-in">
      <h2 className="about-page__title">About MOR Finance Developer Academy</h2>
      <p className="about-page__desc">
        Learn why the Academy exists, how it supports the blockchain ecosystem, and where our curriculum takes you.
      </p>

      <div className="about-page__grid">
        <div className="about-card">
          <h3 className="about-card__title">Our Mission</h3>
          <p className="about-card__text">
            The MOR Finance Developer Academy bridges the gap between structured education and actual open-source smart contract engineering. By completing interactive lessons, compiler sandboxes, and quizzes, developers verify their Web3 knowledge and build a trackable profile that is recognized across the ecosystem.
          </p>
        </div>

        <div className="about-card">
          <h3 className="about-card__title">Supported Ecosystems</h3>
          <p className="about-card__text">
            We support smart contract development and deployment across Ethereum, Arbitrum, Optimism, Polygon, Base, Avalanche, and Solana. Our playground equips engineers to write optimized, reentrancy-safe, and secure smart contracts for Layer 1 and Layer 2 decentralized platforms.
          </p>
        </div>
      </div>

      <div className="about-divider" />

      <h3 className="about-section-title">Academy Milestones</h3>
      <div className="about-milestones">
        {[
          { step: '01', title: 'Blockchain & Network Basics', desc: 'Understand peer-to-peer decentralization, hashing cryptography, public/private keys, and gas pricing mechanics.' },
          { step: '02', title: 'Smart Contract Development', desc: 'Write, compile, and run Solidity code, verify modifier permissions, and design safe storage layout trees.' },
          { step: '03', title: 'Advanced DeFi Integrations', desc: 'Build Automated Market Maker (AMM) pools, prevent reentrancy attacks via CEI, and implement secure vault systems.' },
          { step: '04', title: 'Open Source Contribution', desc: 'Unlock the organization repositories, claim Good First Issues, submit pull requests, and earn verified Developer levels.' }
        ].map((milestone) => (
          <div key={milestone.step} className="milestone-item">
            <span className="milestone-item__step">{milestone.step}</span>
            <div className="milestone-item__content">
              <h4 className="milestone-item__title">{milestone.title}</h4>
              <p className="milestone-item__desc">{milestone.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="about-divider" />

      {/* Discord Community Section */}
      <div className="about-discord glass">
        <div className="about-discord__info">
          <h3 className="about-discord__title">Join Our Discord Community</h3>
          <p className="about-discord__sub">Connect with developers, ask questions, get live office hours support, and collaborate.</p>
        </div>
        <a
          href="https://discord.gg/Jjt52cQEV"
          target="_blank"
          rel="noopener noreferrer"
          className="about-discord__btn"
        >
          💬 Join Discord
        </a>
      </div>
    </div>
  );
};

export default AboutPage;
