import React from 'react';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page glass animate-fade-in" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 11, 23, 0.45)', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>About MOR Finance Developer Academy</h2>
      <p style={{ fontSize: '1rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
        Learn why the Academy exists, how it supports the blockchain ecosystem, and where our curriculum takes you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Our Mission</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6' }}>
            The MOR Finance Developer Academy bridges the gap between structured education and actual open-source smart contract engineering. By completing interactive lessons, compiler sandboxes, and quizzes, developers verify their Web3 knowledge and build a trackable profile that is recognized across the ecosystem.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Supported Ecosystems</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6' }}>
            We support smart contract development and deployment across Ethereum, Arbitrum, Optimism, Polygon, Base, Avalanche, and Solana. Our playground equips engineers to write optimized, reentrancy-safe, and secure smart contracts for Layer 1 and Layer 2 decentralized platforms.
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '32px' }} />

      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Academy Milestones</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[
          { step: '01', title: 'Blockchain & Network Basics', desc: 'Understand peer-to-peer decentralization, hashing cryptography, public/private keys, and gas pricing mechanics.' },
          { step: '02', title: 'Smart Contract Development', desc: 'Write, compile, and run Solidity code, verify modifier permissions, and design safe storage layout trees.' },
          { step: '03', title: 'Advanced DeFi Integrations', desc: 'Build Automated Market Maker (AMM) pools, prevent reentrancy attacks via CEI, and implement secure vault systems.' },
          { step: '04', title: 'Open Source Contribution', desc: 'Unlock the organization repositories, claim Good First Issues, submit pull requests, and earn verified Developer levels.' }
        ].map((milestone) => (
          <div key={milestone.step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', width: '32px' }}>{milestone.step}</span>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>{milestone.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', margin: 0 }}>{milestone.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
