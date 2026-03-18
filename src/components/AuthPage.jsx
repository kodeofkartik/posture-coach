import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#alg)" />
            <path d="M16 6C14 6 12 8 12 10C12 12 14 14 16 14C18 14 20 12 20 10C20 8 18 6 16 6Z" fill="white" opacity="0.9"/>
            <path d="M10 16C9 16 8 17 8 18L9 24C9 25 10 26 11 26L13 26L14 20L16 22L18 20L19 26L21 26C22 26 23 25 23 24L24 18C24 17 23 16 22 16L10 16Z" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="alg" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="auth-title">Posture Coach</h1>
        <p className="auth-subtitle">AI-powered posture monitoring & health insights</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button className="btn-accent auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> {mode === 'signup' ? 'Creating account...' : 'Signing in...'}</>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
