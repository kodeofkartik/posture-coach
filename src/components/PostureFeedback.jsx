export default function PostureFeedback({ postureData }) {
  if (!postureData) {
    return (
      <div className="feedback-card neutral">
        <div className="feedback-pulse" />
        <h2>Waiting for detection...</h2>
        <p className="feedback-sub">Position yourself so your upper body is visible</p>
      </div>
    );
  }

  const { isSlouching, angle, confidence } = postureData;

  return (
    <div className={`feedback-card ${isSlouching ? 'bad' : 'good'}`}>
      <div className="feedback-icon">
        {isSlouching ? '\u26A0' : '\u2713'}
      </div>
      <h2>{isSlouching ? 'You are slouching' : 'Good posture'}</h2>
      <div className="angle-display">
        <svg viewBox="0 0 120 120" className="angle-ring">
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.15" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={`${(angle / 180) * 327} 327`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="700">
            {angle}°
          </text>
          <text x="60" y="74" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.7">
            {confidence} conf.
          </text>
        </svg>
      </div>
    </div>
  );
}
