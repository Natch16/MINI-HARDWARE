/**
 * auth.js — User registration, login, logout, and session management
 * Passwords are stored as a simple hash (not cryptographic — frontend only).
 * Session is kept in sessionStorage so it clears on tab close.
 */

import { Store } from './store.js';

const Auth = (() => {
  const SESSION_KEY = 'jh_session';

  // Simple non-cryptographic hash for demo purposes
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return 'h' + Math.abs(hash).toString(36);
  }

  function getUsers() {
    return Store.getAll(Store.KEYS.USERS);
  }

  function saveUsers(users) {
    Store.save(Store.KEYS.USERS, users);
  }

  /**
   * Register a new user and automatically log them in.
   * @returns {{ ok: boolean, error?: string, user?: object }}
   */
  function register({ name, email, password }) {
    if (!name || !name.trim()) return { ok: false, error: 'Full name is required.' };
    if (!email || !email.trim()) return { ok: false, error: 'Email is required.' };
    if (!password || password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const users = getUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { ok: false, error: 'An account with this email already exists.' };

    const user = {
      id:        Store.generateId(),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      password:  hashPassword(password),
      createdAt: new Date().toISOString(),
      isNew:     true,
    };
    saveUsers([...users, user]);

    // Auto-login: start session immediately after registration
    const session = _publicUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Flag so account page can show a welcome message
    sessionStorage.setItem('jh_new_user', '1');

    return { ok: true, user: session };
  }

  /**
   * Log in an existing user.
   * @returns {{ ok: boolean, error?: string, user?: object }}
   */
  function login({ email, password }) {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };
    const users = getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());
    if (!user) return { ok: false, error: 'No account found with that email.' };
    if (user.password !== hashPassword(password)) return { ok: false, error: 'Incorrect password.' };

    const session = _publicUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  }

  /** Log out the current user. */
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /** Returns the current logged-in user object, or null. */
  function currentUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Returns true if a user is logged in. */
  function isLoggedIn() {
    return currentUser() !== null;
  }

  /**
   * Redirect to login page if not logged in.
   * @param {string} [returnTo] - page to return to after login
   */
  function requireAuth(returnTo) {
    if (!isLoggedIn()) {
      const dest = returnTo || window.location.pathname.split('/').pop();
      window.location.href = `login.html?next=${encodeURIComponent(dest)}`;
    }
  }

  function _publicUser(u) {
    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
  }

  /**
   * Update the current user's name and/or password.
   * @param {{ name?: string, currentPassword?: string, newPassword?: string }} data
   * @returns {{ ok: boolean, error?: string }}
   */
  function updateProfile(data) {
    const session = currentUser();
    if (!session) return { ok: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx   = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'Account not found.' };

    const user = users[idx];
    const updated = { ...user };

    // Update name
    if (data.name !== undefined) {
      if (!data.name.trim()) return { ok: false, error: 'Name cannot be empty.' };
      updated.name = data.name.trim();
    }

    // Update password
    if (data.newPassword !== undefined && data.newPassword !== '') {
      if (!data.currentPassword) return { ok: false, error: 'Current password is required to set a new one.' };
      if (user.password !== hashPassword(data.currentPassword)) return { ok: false, error: 'Current password is incorrect.' };
      if (data.newPassword.length < 6) return { ok: false, error: 'New password must be at least 6 characters.' };
      updated.password = hashPassword(data.newPassword);
    }

    users[idx] = updated;
    saveUsers(users);

    // Refresh session with updated name
    const newSession = _publicUser(updated);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return { ok: true, user: newSession };
  }

  return { register, login, logout, currentUser, isLoggedIn, requireAuth, updateProfile };
})();

export { Auth };
