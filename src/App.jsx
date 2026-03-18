import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Webcam from './components/Webcam';
import PostureFeedback from './components/PostureFeedback';
import SessionTracker from './components/SessionTracker';
import CalibrationPanel from './components/CalibrationPanel';
import SessionSummary from './components/SessionSummary';
import SessionHistory from './components/SessionHistory';
import { initPoseDetector } from './services/poseDetection';
import { playSlouchAlert } from './utils/soundAlert';
import { loadSessions } from './utils/sessionStorage';
import './App.css';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [modelReady, setModelReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [postureData, setPostureData] = useState(null);
  const [calibrationAngle, setCalibrationAngle] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState(() => loadSessions());
  const [viewSession, setViewSession] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [awayPaused, setAwayPaused] = useState(false);

  const videoRef = useRef(null);
  const lastAlertTime = useRef(0);

  async function handleStart() {
    if (!modelReady) {
      setLoading(true);
      setError(null);
      try {
        await initPoseDetector();
        setModelReady(true);
      } catch {
        setError('Failed to load pose model. Check your connection.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setIsRunning(true);
  }

  function handleStop() {
    setIsRunning(false);
    setAwayPaused(false);
  }

  const handlePostureUpdate = useCallback(
    (result) => {
      setPostureData(result);
      if (result?.isSlouching && soundEnabled) {
        const now = Date.now();
        if (now - lastAlertTime.current > 5000) {
          lastAlertTime.current = now;
          playSlouchAlert();
        }
      }
    },
    [soundEnabled]
  );

  function handleUserAway() {
    setIsRunning(false);
    setAwayPaused(true);
  }

  function handleStart_resume() {
    setAwayPaused(false);
    handleStart();
  }

  function handleSessionEnd(session, allSessions) {
    setSessions(allSessions);
    setLastSession(session);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const vid = document.querySelector('.webcam-container video');
      if (vid) {
        videoRef.current = vid;
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="auth-loading">
        <span className="spinner" />
      </div>
    );
  }

  // Show auth page if not signed in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-mark">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#lg)" />
            <path d="M16 6C14 6 12 8 12 10C12 12 14 14 16 14C18 14 20 12 20 10C20 8 18 6 16 6Z" fill="white" opacity="0.9"/>
            <path d="M10 16C9 16 8 17 8 18L9 24C9 25 10 26 11 26L13 26L14 20L16 22L18 20L19 26L21 26C22 26 23 25 23 24L24 18C24 17 23 16 22 16L10 16Z" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h1>Posture Coach</h1>
          <p className="subtitle">AI-powered posture monitoring & health insights</p>
        </div>
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          <button className="btn-ghost-sm" onClick={signOut}>Sign Out</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="main-col">
          <div className="video-section">
            <Webcam
              isRunning={isRunning}
              calibrationAngle={calibrationAngle}
              onPostureUpdate={handlePostureUpdate}
              onUserAway={handleUserAway}
            />
            <div className="video-overlay-badge">
              {awayPaused && (
                <span className="badge-away">NO PERSON DETECTED — PAUSED</span>
              )}
              {isRunning && postureData && !awayPaused && (
                <span className={postureData.isSlouching ? 'badge-bad' : 'badge-good'}>
                  {postureData.isSlouching ? 'SLOUCHING' : 'GOOD'}
                </span>
              )}
            </div>
          </div>

          <div className="controls">
            {!isRunning ? (
              <button className="btn-accent btn-lg" onClick={handleStart_resume} disabled={loading}>
                {loading ? (
                  <><span className="spinner" /> Loading Model...</>
                ) : (
                  <>{awayPaused ? '\u25B6 Resume (was away)' : modelReady ? '\u25B6 Resume' : '\u25B6 Start Monitoring'}</>
                )}
              </button>
            ) : (
              <button className="btn-secondary btn-lg" onClick={handleStop}>
                {'\u23F8'} Pause & Save
              </button>
            )}

            <label className="toggle-pill">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              {'\uD83D\uDD14'} Sound
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <SessionHistory sessions={sessions} onViewSession={setViewSession} />
        </div>

        <div className="side-panel">
          <PostureFeedback postureData={postureData} />

          <CalibrationPanel
            videoRef={videoRef}
            onCalibrate={setCalibrationAngle}
            calibrationAngle={calibrationAngle}
          />

          <SessionTracker
            postureData={postureData}
            isRunning={isRunning}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      </main>

      {(viewSession || lastSession) && (
        <SessionSummary
          session={viewSession || lastSession}
          onClose={() => { setViewSession(null); setLastSession(null); }}
        />
      )}
    </div>
  );
}
