// ─── ProgressBar — animated horizontal progress indicator ────────────────────
import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;         // 0–100
  color?: string;
  height?: number;
  label?: string;
  showPct?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'var(--clr-primary)',
  height = 8,
  label,
  showPct = true,
}) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-bar-wrapper">
      {(label || showPct) && (
        <div className="progress-bar-meta">
          {label && <span className="progress-bar-label">{label}</span>}
          {showPct && <span className="progress-bar-pct">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
