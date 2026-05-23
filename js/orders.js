/**
 * orders.js — Place, retrieve, and cancel orders
 *
 * Order statuses: 'pending' | 'confirmed' | 'cancelled'
 *
 * Order object:
 * {
 *   id, userId, userName, userEmail,
 *   productId, productName, productPrice,
 *   quantity, barangay, address,
 *   deliveryFee, totalPrice,
 *   notes, status, createdAt
 * }
 */

import { Store } from './store.js';
import { Auth } from './auth.js';
import { Delivery } from './delivery.js';

const Orders = (() => {

  function getAll() {
    return Store.getAll(Store.KEYS.ORDERS);
  }

  function getByUser(userId) {
    return getAll().filter(o => o.userId === userId);
  }

  /**
   * Place a new order.
   * @param {object} data
   * @returns {{ ok: boolean, error?: string, order?: object }}
   */
  function place(data) {
    const user = Auth.currentUser();
    if (!user) return { ok: false, error: 'You must be logged in to place an order.' };

    const { productId, productName, productPrice, quantity, barangay, address, notes } = data;
    if (!productId || !productName) return { ok: false, error: 'Invalid product.' };
    if (!quantity || quantity < 1) return { ok: false, error: 'Quantity must be at least 1.' };
    if (!barangay || !barangay.trim()) return { ok: false, error: 'Barangay is required for delivery.' };

    const deliveryInfo = Delivery.getDeliveryInfo(barangay);
    const qty = parseInt(quantity, 10);
    const unitPrice = Number(productPrice);
    const totalPrice = (unitPrice * qty) + deliveryInfo.fee;

    const order = {
      id:           Store.generateId(),
      userId:       user.id,
      userName:     user.name,
      userEmail:    user.email,
      productId,
      productName,
      productPrice: unitPrice,
      quantity:     qty,
      barangay:     barangay.trim(),
      address:      (address || '').trim(),
      deliveryFee:  deliveryInfo.fee,
      deliveryFree: deliveryInfo.free,
      totalPrice,
      notes:        (notes || '').trim(),
      status:       'pending',
      createdAt:    new Date().toISOString(),
    };

    const orders = getAll();
    Store.save(Store.KEYS.ORDERS, [...orders, order]);
    return { ok: true, order };
  }

  /**
   * Cancel an order (only if status is 'pending' and belongs to current user).
   * @returns {{ ok: boolean, error?: string }}
   */
  function cancel(orderId) {
    const user = Auth.currentUser();
    if (!user) return { ok: false, error: 'Not logged in.' };

    const orders = getAll();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return { ok: false, error: 'Order not found.' };

    const order = orders[idx];
    if (order.userId !== user.id) return { ok: false, error: 'You can only cancel your own orders.' };
    if (order.status !== 'pending') return { ok: false, error: 'Only pending orders can be cancelled.' };

    orders[idx] = { ...order, status: 'cancelled' };
    Store.save(Store.KEYS.ORDERS, orders);
    return { ok: true };
  }

  /** Admin: update order status */
  function updateStatus(orderId, status) {
    const orders = getAll();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    orders[idx] = { ...orders[idx], status };
    Store.save(Store.KEYS.ORDERS, orders);
    return true;
  }

  function statusLabel(status) {
    return {
      pending:           'Pending',
      payment_pending:   'Awaiting Payment Review',
      paid:              'Paid',
      payment_rejected:  'Payment Rejected',
      confirmed:         'Confirmed',
      cancelled:         'Cancelled',
    }[status] || status;
  }

  function statusColor(status) {
    return {
      pending:           '#e65100',
      payment_pending:   '#1565c0',
      paid:              '#1b5e20',
      payment_rejected:  '#c62828',
      confirmed:         '#1b5e20',
      cancelled:         '#555',
    }[status] || '#333';
  }

  return { getAll, getByUser, place, cancel, updateStatus, statusLabel, statusColor };
})();

export { Orders };
