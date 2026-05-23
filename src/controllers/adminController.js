/**
 * adminController.js — Admin-facing controller wrappers
 * Implements AdminAuth inline and wraps Store, Orders, Payment for admin pages.
 */

import { Store } from '../../js/store.js';
import { Orders } from '../../js/orders.js';
import { Payment } from '../../js/payment.js';

// ── Admin Auth ────────────────────────────────────────────────────────────────
const SESSION_KEY = 'jh_admin_session';
const CREDS_KEY   = 'jh_admin_creds';
const DEFAULT_CREDS = { username: 'admin', password: 'admin123' };

function _getCredentials() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CREDS;
  } catch {
    return DEFAULT_CREDS;
  }
}

export const adminAuthController = {
  login(username, password) {
    const creds = _getCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: creds.username }));
      return { ok: true };
    }
    return { ok: false, error: 'Incorrect username or password.' };
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  isLoggedIn() {
    try {
      return !!sessionStorage.getItem(SESSION_KEY);
    } catch {
      return false;
    }
  },

  currentAdmin() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/admin/login';
    }
  },
};

// ── Products CRUD ─────────────────────────────────────────────────────────────
export const productController = {
  getAll() {
    return Store.getAll(Store.KEYS.PRODUCTS);
  },

  save(product) {
    let products = Store.getAll(Store.KEYS.PRODUCTS);
    if (product.id && products.some(p => p.id === product.id)) {
      products = products.map(p => p.id === product.id ? { ...p, ...product } : p);
    } else {
      const newProduct = { id: Store.generateId(), ...product };
      products = [...products, newProduct];
    }
    Store.save(Store.KEYS.PRODUCTS, products);
  },

  delete(id) {
    const products = Store.getAll(Store.KEYS.PRODUCTS).filter(p => p.id !== id);
    Store.save(Store.KEYS.PRODUCTS, products);
  },
};

// ── Categories CRUD ───────────────────────────────────────────────────────────
export const categoryController = {
  getAll() {
    return Store.getAll(Store.KEYS.CATEGORIES);
  },

  save(category) {
    let categories = Store.getAll(Store.KEYS.CATEGORIES);
    if (category.id && categories.some(c => c.id === category.id)) {
      categories = categories.map(c => c.id === category.id ? { ...c, ...category } : c);
    } else {
      const newCategory = { id: Store.generateId(), ...category };
      categories = [...categories, newCategory];
    }
    Store.save(Store.KEYS.CATEGORIES, categories);
  },

  delete(id) {
    // Remove the category
    const categories = Store.getAll(Store.KEYS.CATEGORIES).filter(c => c.id !== id);
    Store.save(Store.KEYS.CATEGORIES, categories);
    // Cascade: clear category field on products that referenced it
    const products = Store.getAll(Store.KEYS.PRODUCTS).map(p =>
      p.category === id ? { ...p, category: '' } : p
    );
    Store.save(Store.KEYS.PRODUCTS, products);
  },
};

// ── Orders (admin view) ───────────────────────────────────────────────────────
export const adminOrderController = {
  getAll() {
    return Store.getAll(Store.KEYS.ORDERS);
  },

  updateStatus(id, status) {
    return Orders.updateStatus(id, status);
  },
};

// ── Payments (admin view) ─────────────────────────────────────────────────────
export const adminPaymentController = {
  getAll() {
    return Payment.getAll();
  },

  review(paymentId, status) {
    return Payment.review(paymentId, status);
  },

  saveGcashConfig(config) {
    Payment.saveGcashConfig(config);
  },
};

// ── Inquiries ─────────────────────────────────────────────────────────────────
export const inquiryController = {
  getAll() {
    return Store.getAll(Store.KEYS.INQUIRIES);
  },

  markRead(id) {
    const inquiries = Store.getAll(Store.KEYS.INQUIRIES).map(i =>
      i.id === id ? { ...i, read: true } : i
    );
    Store.save(Store.KEYS.INQUIRIES, inquiries);
  },

  markUnread(id) {
    const inquiries = Store.getAll(Store.KEYS.INQUIRIES).map(i =>
      i.id === id ? { ...i, read: false } : i
    );
    Store.save(Store.KEYS.INQUIRIES, inquiries);
  },

  delete(id) {
    const inquiries = Store.getAll(Store.KEYS.INQUIRIES).filter(i => i.id !== id);
    Store.save(Store.KEYS.INQUIRIES, inquiries);
  },
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsController = {
  get() {
    return Store.getSettings();
  },

  save(partial) {
    const current = Store.getSettings();
    Store.saveSettings({ ...current, ...partial });
  },
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardController = {
  getMetrics() {
    const products   = Store.getAll(Store.KEYS.PRODUCTS);
    const categories = Store.getAll(Store.KEYS.CATEGORIES);
    const orders     = Store.getAll(Store.KEYS.ORDERS);
    const inquiries  = Store.getAll(Store.KEYS.INQUIRIES);

    const availableStock = products.filter(p => p.available).length;
    const totalOrders    = orders.length;
    const pendingOrders  = orders.filter(o => o.status === 'pending').length;
    const unreadMsgs     = inquiries.filter(i => !i.read).length;
    const totalSales     = orders
      .filter(o => o.status === 'confirmed')
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return {
      products:       products.length,
      categories:     categories.length,
      availableStock,
      totalOrders,
      pendingOrders,
      unreadMsgs,
      totalSales,
    };
  },
};
