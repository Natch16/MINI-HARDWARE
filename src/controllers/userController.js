/**
 * userController.js — User-facing controller wrappers
 * Wraps Auth, Orders, Payment, Delivery, and Store for use in React pages.
 */

import { Store } from '../../js/store.js';
import { Auth } from '../../js/auth.js';
import { Orders } from '../../js/orders.js';
import { Payment } from '../../js/payment.js';
import { Delivery } from '../../js/delivery.js';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authController = {
  register:      (data)          => Auth.register(data),
  login:         (data)          => Auth.login(data),
  logout:        ()              => Auth.logout(),
  currentUser:   ()              => Auth.currentUser(),
  isLoggedIn:    ()              => Auth.isLoggedIn(),
  requireAuth:   (returnTo)      => Auth.requireAuth(returnTo),
  updateProfile: (data)          => Auth.updateProfile(data),
};

// ── Orders ───────────────────────────────────────────────────────────────────
export const orderController = {
  place:       (data)            => Orders.place(data),
  cancel:      (orderId)         => Orders.cancel(orderId),
  getByUser:   (userId)          => Orders.getByUser(userId),
  statusLabel: (status)          => Orders.statusLabel(status),
  statusColor: (status)          => Orders.statusColor(status),
};

// ── Payment ──────────────────────────────────────────────────────────────────
export const paymentController = {
  submit:          (data)        => Payment.submit(data),
  getByOrder:      (orderId)     => Payment.getByOrder(orderId),
  getByUser:       (userId)      => Payment.getByUser(userId),
  getGcashConfig:  ()            => Payment.getGcashConfig(),
  statusLabel:     (status)      => Payment.statusLabel(status),
  statusColor:     (status)      => Payment.statusColor(status),
};

// ── Delivery ─────────────────────────────────────────────────────────────────
export const deliveryController = {
  getDeliveryInfo:  (barangay)   => Delivery.getDeliveryInfo(barangay),
  getFreeBarangays: ()           => Delivery.getFreeBarangays(),
};

// ── Store / Settings ──────────────────────────────────────────────────────────
export const storeController = {
  getSettings:   () => Store.getSettings(),
  getProducts:   () => Store.getAll(Store.KEYS.PRODUCTS),
  getCategories: () => Store.getAll(Store.KEYS.CATEGORIES),
};

// ── Pure filter functions (ported verbatim from js/products.js) ───────────────

/**
 * Filter products by category ids.
 * Returns all products when categoryIds is empty.
 */
export function filterByCategory(products, categoryIds) {
  if (!categoryIds || categoryIds.length === 0) return products;
  return products.filter(p => categoryIds.includes(p.category));
}

/**
 * Filter products by price range [min, max].
 * Null / undefined / NaN bounds are treated as unbounded.
 */
export function filterByPrice(products, min, max) {
  return products.filter(p => {
    const price = Number(p.price);
    const aboveMin = (min === null || min === undefined || isNaN(min)) ? true : price >= min;
    const belowMax = (max === null || max === undefined || isNaN(max)) ? true : price <= max;
    return aboveMin && belowMax;
  });
}
