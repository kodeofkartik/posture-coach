import { useState } from 'react';
import { getPostureGrade, getHealthImpacts, getSessionSummaryText } from '../utils/healthInsights';

export default function SessionSummary({ session, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const grade = getPostureGrade(session.goodPct);
  const impacts = getHealthImpacts(session.goodPct, session.slouchEvents, session.durationSec / 60);

  async function handleCopy() {
    const text = getSessionSummaryText(session);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="summary-overlay" onClick={onClose}>
      <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
        <button className="summary-close" onClick={onClose}>{'\u2715'}</button>

        <div className="summary-header">
          <h2>Session Complete</h2>
          <p className="summary-date">{new Date(session.date).toLocaleString()}</p>
        </div>

        <div className="grade-ring" style={{ '--grade-color': grade.color }}>
          <svg viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.1" />
            <circle
              cx="70" cy="70" r="60"
              fill="none"
              stroke={grade.color}
              strokeWidth="8"
              strokeDasharray={`${(session.goodPct / 100) * 377} 377`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="62" textAnchor="middle" fill={grade.color} fontSize="36" fontWeight="800">
              {grade.grade}
            </text>
            <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontSize="12">
              {grade.label}
            </text>
          </svg>
        </div>

        <div className="summary-stats">
          <div className="summary-stat">
            <span className="ss-val">{session.durationFormatted}</span>
            <span className="ss-label">Duration</span>
          </div>
          <div className="summary-stat">
            <span className="ss-val" style={{ color: grade.color }}>{session.goodPct}%</span>
            <span className="ss-label">Good Posture</span>
          </div>
          <div className="summary-stat">
            <span className="ss-val">{session.slouchEvents}</span>
            <span className="ss-label">Slouch Events</span>
          </div>
          <div className="summary-stat">
            <span className="ss-val">{session.avgAngle}°</span>
            <span className="ss-label">Avg Angle</span>
          </div>
        </div>

        <div className="health-impacts">
          <h3>Health Insights</h3>
          {impacts.map((impact, i) => (
            <div key={i} className={`impact-card impact-${impact.type}`}>
              <span className="impact-icon">{impact.icon}</span>
              <div>
                <strong>{impact.title}</strong>
                <p>{impact.text}</p>
              </div>
            </div>
          ))}
          {impacts.length === 0 && (
            <p className="no-impacts">Complete a longer session for detailed health insights.</p>
          )}
        </div>

        <div className="summary-actions">
          <button className="btn-accent" onClick={handleCopy}>
            {copied ? '\u2713 Copied!' : '\uD83D\uDCCB Copy Summary'}
          </button>
        </div>
      </div>
    </div>
  );
}
