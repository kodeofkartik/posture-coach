const STORAGE_KEY = 'posture-coach-sessions';

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = loadSessions();
  sessions.unshift(session);
  // Keep last 50 sessions
  if (sessions.length > 50) sessions.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}
