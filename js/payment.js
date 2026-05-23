/**
 * payment.js — Payment proof submission and management
 *
 * Payment object:
 * {
 *   id, orderId, userId, userName, userEmail,
 *   productName, amountPaid, paymentMethod,
 *   proofImage (base64), status, notes,
 *   createdAt, reviewedAt
 * }
 * status: 'pending' | 'approved' | 'rejected'
 */

import { Store } from './store.js';
import { Orders } from './orders.js';
import { Auth } from './auth.js';

const Payment = (() => {

  const GCASH_KEY = 'jh_gcash';

  const DEFAULT_GCASH = {
    name:   'Judy Hardware',
    number: '09XX XXX XXXX',
    qrSrc:  '',
  };

  function getGcashConfig() {
    try {
      var raw = localStorage.getItem(GCASH_KEY);
      return raw ? Object.assign({}, DEFAULT_GCASH, JSON.parse(raw)) : DEFAULT_GCASH;
    } catch (e) {
      return DEFAULT_GCASH;
    }
  }

  function saveGcashConfig(obj) {
    try {
      localStorage.setItem(GCASH_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function getAll() {
    return Store.getAll(Store.KEYS.PAYMENTS);
  }

  function getByOrder(orderId) {
    return getAll().find(function(p) { return p.orderId === orderId; }) || null;
  }

  function getByUser(userId) {
    return getAll().filter(function(p) { return p.userId === userId; });
  }

  /**
   * Submit payment proof.
   * @param {object} data - { orderId, productName, amountPaid, paymentMethod, proofImage, notes }
   * @returns {{ ok: boolean, error?: string }}
   */
  function submit(data) {
    var user = Auth.currentUser();
    if (!user) return { ok: false, error: 'You must be logged in.' };
    if (!data.orderId)      return { ok: false, error: 'Order ID is required.' };
    if (!data.amountPaid)   return { ok: false, error: 'Amount paid is required.' };
    if (!data.paymentMethod) return { ok: false, error: 'Payment method is required.' };
    if (data.paymentMethod === 'gcash' && !data.proofImage) {
      return { ok: false, error: 'Payment screenshot is required for GCash.' };
    }

    var payment = {
      id:            Store.generateId(),
      orderId:       data.orderId,
      userId:        user.id,
      userName:      user.name,
      userEmail:     user.email,
      productName:   data.productName || '',
      amountPaid:    Number(data.amountPaid),
      paymentMethod: data.paymentMethod,
      proofImage:    data.proofImage || null,
      notes:         (data.notes || '').trim(),
      status:        'pending',
      createdAt:     new Date().toISOString(),
      reviewedAt:    null,
    };

    var payments = getAll();
    Store.save(Store.KEYS.PAYMENTS, [...payments, payment]);

    // Also update order payment status
    Orders.updateStatus(data.orderId, 'payment_pending');

    return { ok: true, payment: payment };
  }

  /**
   * Admin: approve or reject a payment.
   */
  function review(paymentId, status) {
    var payments = getAll();
    var idx = payments.findIndex(function(p) { return p.id === paymentId; });
    if (idx === -1) return false;
    payments[idx] = Object.assign({}, payments[idx], {
      status: status,
      reviewedAt: new Date().toISOString(),
    });
    Store.save(Store.KEYS.PAYMENTS, payments);

    // Sync order status
    var orderId = payments[idx].orderId;
    Orders.updateStatus(orderId, status === 'approved' ? 'paid' : 'payment_rejected');
    return true;
  }

  function statusLabel(status) {
    var labels = {
      pending:          'Pending Review',
      approved:         'Approved',
      rejected:         'Rejected',
    };
    return labels[status] || status;
  }

  function statusColor(status) {
    var colors = {
      pending:          '#e65100',
      approved:         '#1b5e20',
      rejected:         '#c62828',
    };
    return colors[status] || '#333';
  }

  return {
    getAll, getByOrder, getByUser, submit, review,
    statusLabel, statusColor,
    getGcashConfig, saveGcashConfig,
  };
})();

export { Payment };
