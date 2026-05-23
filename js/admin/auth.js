/**
 * admin/auth.js — Admin login/logout/session for JUDY'S Mini Hardware
 * Default credentials: username = admin, password = admin123
 * Credentials are stored in localStorage under jh_admin_creds.
 */
const AdminAuth = (() => {
  const SESSION_KEY = 'jh_admin_session';
  const CREDS_KEY   = 'jh_admin_creds';

  function getCredentials() {
    try {
      const raw = localStorage.getItem(CREDS_KEY);
      return raw ? JSON.parse(raw) : { username: 'admin', password: 'admin123' };
    } catch (e) {
      return { username: 'admin', password: 'admin123' };
    }
  }

  function login(username, password) {
    const creds = getCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: creds.username }));
      return { ok: true };
    }
    return { ok: false, error: 'Incorrect username or password.' };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    try {
      return !!sessionStorage.getItem(SESSION_KEY);
    } catch (e) {
      return false;
    }
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }

  function currentAdmin() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  return { login, logout, isLoggedIn, requireAuth, currentAdmin };
})();
