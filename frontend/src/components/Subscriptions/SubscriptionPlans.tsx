import React, { useState } from 'react';
import './SubscriptionPlans.css';

export const SubscriptionPlans: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Explorer (Free)',
      description: 'Start learning blockchain fundamentals and get familiar with smart contract concepts.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: 'Core Roadmap Access (Levels 1-3)', enabled: true },
        { text: 'Standard compiler challenges', enabled: true },
        { text: 'Community forum participation', enabled: true },
        { text: 'AI Mentor assistant (OpenClaw)', enabled: false },
        { text: 'Verified smart contract certificates', enabled: false },
        { text: 'Web3 hackathons entry submissions', enabled: false },
      ],
      ctaText: 'Current Plan',
      recommended: false,
      disabled: true,
    },
    {
      name: 'Protocol Engineer (Pro)',
      description: 'Unlock advanced Web3 modules, unlimited AI engineer mentorship, and verified credentials.',
      monthlyPrice: 29,
      yearlyPrice: 23,
      features: [
        { text: 'All 7 Levels & Ecosystem tracks', enabled: true },
        { text: 'Advanced compiler sandboxes', enabled: true },
        { text: 'Unlimited AI Mentor (OpenClaw & Hermes)', enabled: true },
        { text: 'Verified Verifiable Credentials (PDF)', enabled: true },
        { text: 'Web3 Hackathons entry submissions', enabled: true },
        { text: 'Priority Forum badges & badges search', enabled: true },
      ],
      ctaText: 'Upgrade to Pro',
      recommended: true,
      disabled: false,
    },
    {
      name: 'Ecosystem Validator',
      description: 'For teams, builders, and protocols requiring custom deployments and support.',
      monthlyPrice: 149,
      yearlyPrice: 119,
      features: [
        { text: 'All features of Protocol Engineer plan', enabled: true },
        { text: 'Custom track curriculum generation', enabled: true },
        { text: 'Validator node integration templates', enabled: true },
        { text: 'Dedicated institutional dev channel', enabled: true },
        { text: 'Ecosystem introductions & grants push', enabled: true },
        { text: 'Priority 2-hour response time SLA', enabled: true },
      ],
      ctaText: 'Get Validator Access',
      recommended: false,
      disabled: false,
    }
  ];

  const featuresComparison = [
    { name: 'Core Roadmap Modules (Levels 1-3)', explorer: '✓', pro: '✓', validator: '✓' },
    { name: 'Advanced Levels & Tracks (Levels 4-7)', explorer: '✖', pro: '✓', validator: '✓' },
    { name: 'Concept Explanations (OpenClaw AI)', explorer: 'Standard', pro: 'Unlimited', validator: 'Unlimited' },
    { name: 'Code Review & Debugging (Hermes AI)', explorer: '✖', pro: '✓', validator: '✓' },
    { name: 'Verified Certificates', explorer: '✖', pro: '✓', validator: '✓' },
    { name: 'Web3 Hackathons Registration', explorer: '✖', pro: '✓', validator: '✓' },
    { name: 'Custom Track Curriculum Dev', explorer: '✖', pro: '✖', validator: '✓' },
    { name: 'Ecosystem Intros & Grants', explorer: '✖', pro: '✖', validator: '✓' },
    { name: 'Developer Relations SLA', explorer: '✖', pro: '24 hours', validator: '2 hours' },
  ];

  return (
    <div className="subscription-plans glass animate-fade-in">
      <div className="subscription-plans__header">
        <h2 className="subscription-plans__title">Find the plan that matches your journey</h2>
        <p className="subscription-plans__subtitle">
          Accelerate your blockchain engineering skills, secure onchain credentials, and build with verified developer authority.
        </p>

        {/* Toggle */}
        <div className="billing-toggle">
          <button 
            className={`billing-toggle__btn ${billingPeriod === 'monthly' ? 'billing-toggle__btn--active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly Billing
          </button>
          <button 
            className={`billing-toggle__btn ${billingPeriod === 'yearly' ? 'billing-toggle__btn--active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly Billing
          </button>
          <span className="billing-toggle__discount">Save 20%</span>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="plans-grid">
        {plans.map((plan) => {
          const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <div key={plan.name} className={`plan-card ${plan.recommended ? 'plan-card--recommended' : ''}`}>
              {plan.recommended && <div className="plan-card__badge">RECOMMENDED</div>}
              <h3 className="plan-card__name">{plan.name}</h3>
              <p className="plan-card__desc">{plan.description}</p>
              
              <div className="plan-card__price-container">
                <span className="plan-card__price">${price}</span>
                <span className="plan-card__period">/ month {billingPeriod === 'yearly' && 'billed annually'}</span>
              </div>

              <span className="plan-card__features-title">Features Included:</span>
              <ul className="plan-card__features-list">
                {plan.features.map((feature, idx) => (
                  <li 
                    key={idx} 
                    className={`plan-card__feature-item ${!feature.enabled ? 'plan-card__feature-item--disabled' : ''}`}
                  >
                    <span className={`plan-card__feature-icon ${!feature.enabled ? 'plan-card__feature-icon--disabled' : ''}`}>
                      {feature.enabled ? '✓' : '✖'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button 
                className={`btn plan-card__cta ${plan.recommended ? 'btn--primary' : 'btn--ghost'}`}
                disabled={plan.disabled}
                onClick={() => alert(`${plan.name} checkout placeholder. Payment integrations will be completed in the next phase.`)}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Detailed Feature Comparison */}
      <div className="comparison-section animate-fade-up">
        <h3 className="comparison-section__title">Compare Plans in Detail</h3>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Explorer</th>
                <th>Protocol Engineer (Pro)</th>
                <th>Ecosystem Validator</th>
              </tr>
            </thead>
            <tbody>
              {featuresComparison.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>
                    <span className={row.explorer === '✖' ? 'comparison-table__cross' : 'comparison-table__check'}>
                      {row.explorer}
                    </span>
                  </td>
                  <td>
                    <span className={row.pro === '✖' ? 'comparison-table__cross' : 'comparison-table__check'}>
                      {row.pro}
                    </span>
                  </td>
                  <td>
                    <span className={row.validator === '✖' ? 'comparison-table__cross' : 'comparison-table__check'}>
                      {row.validator}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
