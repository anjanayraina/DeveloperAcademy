// ─── CertificatesView — showcases user achievements ──────────────────────────
import React, { useState, useEffect } from 'react';
import type { Certificate } from '../../types';
import { fetchCertificates } from '../../api/client';
import './CertificatesView.css';

interface CertificatesViewProps {
  userId: string;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ userId }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCertificates(userId)
      .then((data) => setCerts(data))
      .catch((err) => console.error("Error fetching certificates:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDownload = (cert: Certificate) => {
    alert(`Downloading certificate credentials for level "${cert.level_title}"...\nID: ${cert.certificate_id}`);
  };

  const handleShare = (cert: Certificate) => {
    const text = `I just earned my Developer Academy Level ${cert.level_id} Certificate in "${cert.level_title}"! 🚀 Check out my progress. #Web3Dev #DeveloperAcademy`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="certs-loading">
        <div className="spinner" />
        <p>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="certs-container animate-fade-up">
      <div className="certs-header">
        <h2 className="certs-title">Academy Credentials</h2>
        <p className="certs-subtitle">
          Verifiable credentials representing completed levels in the Developer Academy curriculum.
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="certs-empty-state glass">
          <div className="certs-empty-icon">🏆</div>
          <h3>No credentials earned yet</h3>
          <p>
            Complete all lessons inside any roadmap level to claim your verified Web3 developer certificate!
          </p>
        </div>
      ) : (
        <div className="certs-grid">
          {certs.map((cert) => (
            <div key={cert.certificate_id} className="cert-card glass">
              <div className="cert-card__watermark">⬡</div>
              <div className="cert-card__seal">🛡️</div>
              
              <div className="cert-card__header">
                <span className="cert-card__level">Level {cert.level_id} Complete</span>
                <h3 className="cert-card__title">{cert.level_title}</h3>
              </div>

              <div className="cert-card__recipient">
                <span className="cert-card__lbl">Awarded to:</span>
                <span className="cert-card__val" title={cert.recipient}>
                  {cert.recipient.startsWith("wallet-")
                    ? `${cert.recipient.replace("wallet-", "").slice(0, 8)}...${cert.recipient.replace("wallet-", "").slice(-6)}`
                    : `@${cert.recipient.replace("gh-", "")}`}
                </span>
              </div>

              <div className="cert-card__meta">
                <div>
                  <span className="cert-card__lbl">Issued on:</span>
                  <span className="cert-card__val">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="cert-card__lbl">Credential ID:</span>
                  <span className="cert-card__val cert-card__val--id">
                    {cert.certificate_id.slice(0, 14)}...
                  </span>
                </div>
              </div>

              <div className="cert-card__actions">
                <button className="btn btn--primary" onClick={() => handleDownload(cert)}>
                  💾 Download PDF
                </button>
                <button className="btn btn--secondary" onClick={() => handleShare(cert)}>
                  🐦 Share to X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesView;
