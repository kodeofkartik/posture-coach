import { getPostureGrade } from '../utils/healthInsights';

export default function SessionHistory({ sessions, onViewSession }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="history-panel">
        <h3>Session History</h3>
        <p className="history-empty">No sessions yet. Start monitoring to track your posture over time.</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>Session History</h3>
        <span className="history-count">{sessions.length} sessions</span>
      </div>
      <div className="history-list">
        {sessions.slice(0, 10).map((s) => {
          const grade = getPostureGrade(s.goodPct);
          return (
            <button
              key={s.id}
              className="history-item"
              onClick={() => onViewSession(s)}
            >
              <div className="hi-grade" style={{ background: grade.color }}>
                {grade.grade}
              </div>
              <div className="hi-info">
                <span className="hi-date">
                  {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="hi-details">
                  {s.durationFormatted} &middot; {s.goodPct}% good &middot; {s.slouchEvents} slouches
                </span>
              </div>
              <span className="hi-arrow">{'\u203A'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
