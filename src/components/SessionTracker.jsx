import { useState, useEffect, useRef } from 'react';
import { saveSession } from '../utils/sessionStorage';

export default function SessionTracker({ postureData, isRunning, onSessionEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [goodTime, setGoodTime] = useState(0);
  const [slouchCount, setSlouch] = useState(0);
  const [angleSum, setAngleSum] = useState(0);
  const [angleSamples, setAngleSamples] = useState(0);
  const wasSlouching = useRef(false);
  const lastPosture = useRef(null);
  const wasRunning = useRef(false);

  useEffect(() => {
    lastPosture.current = postureData;
  }, [postureData]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      const p = lastPosture.current;
      if (p && !p.isSlouching) {
        setGoodTime((g) => g + 1);
      }
      if (p && p.angle) {
        setAngleSum((s) => s + p.angle);
        setAngleSamples((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || !postureData) return;
    if (postureData.isSlouching && !wasSlouching.current) {
      setSlouch((c) => c + 1);
    }
    wasSlouching.current = postureData.isSlouching;
  }, [postureData, isRunning]);

  // Detect session end (was running, now stopped) and save
  useEffect(() => {
    if (wasRunning.current && !isRunning && elapsed > 5) {
      const pct = Math.round((goodTime / elapsed) * 100);
      const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        durationSec: elapsed,
        durationFormatted: fmt(elapsed),
        goodPct: pct,
        slouchEvents: slouchCount,
        avgAngle: angleSamples > 0 ? Math.round(angleSum / angleSamples) : 0,
      };
      const updated = saveSession(session);
      onSessionEnd?.(session, updated);
    }
    wasRunning.current = isRunning;
  }, [isRunning]);

  function reset() {
    setElapsed(0);
    setGoodTime(0);
    setSlouch(0);
    setAngleSum(0);
    setAngleSamples(0);
  }

  const pct = elapsed > 0 ? Math.round((goodTime / elapsed) * 100) : 0;

  function fmt(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  }

  return (
    <div className="session-tracker">
      <div className="session-header">
        <h3>Live Session</h3>
        <span className={`session-badge ${isRunning ? 'live' : ''}`}>
          {isRunning ? 'RECORDING' : 'PAUSED'}
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{fmt(elapsed)}</span>
          <span className="stat-label">Duration</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)' }}>
            {pct}%
          </span>
          <span className="stat-label">Good Posture</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{slouchCount}</span>
          <span className="stat-label">Slouch Events</span>
        </div>
      </div>

      <div className="posture-bar">
        <div className="posture-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <button className="btn-ghost" onClick={reset}>Reset Session</button>
    </div>
  );
}
