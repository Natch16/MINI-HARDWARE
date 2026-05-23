/**
 * Store — localStorage CRUD helpers for JUDY'S Mini Hardware
 */
const Store = (() => {
  const KEYS = {
    PRODUCTS:   'jh_products',
    CATEGORIES: 'jh_categories',
    INQUIRIES:  'jh_inquiries',
    SETTINGS:   'jh_settings',
    USERS:      'jh_users',
    ORDERS:     'jh_orders',
    PAYMENTS:   'jh_payments',
    GCASH:      'jh_gcash',
  };

  function getAll(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Store.getAll error:', e);
      return [];
    }
  }

  function save(key, array) {
    try {
      localStorage.setItem(key, JSON.stringify(array));
    } catch (e) {
      console.warn('Store.save error:', e);
    }
  }

  function getSettings() {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Store.getSettings error:', e);
      return {};
    }
  }

  function saveSettings(obj) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(obj));
    } catch (e) {
      console.warn('Store.saveSettings error:', e);
    }
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  return { KEYS, getAll, save, getSettings, saveSettings, generateId };
})();

export { Store };
