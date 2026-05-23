import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// ── In-memory localStorage/sessionStorage mock ────────────────────────────────
// Must be assigned to global BEFORE any module imports that use these APIs.
// In Vitest (Node env) the assignment at module level runs before test execution.
function createStorageMock() {
  let store = {};
  return {
    getItem:    (key)      => (key in store ? store[key] : null),
    setItem:    (key, val) => { store[key] = String(val); },
    removeItem: (key)      => { delete store[key]; },
    clear:      ()         => { store = {}; },
    get length()           { return Object.keys(store).length; },
    key:        (i)        => Object.keys(store)[i] ?? null,
    _reset:     ()         => { store = {}; },
  };
}

const localStorageMock  = createStorageMock();
const sessionStorageMock = createStorageMock();

global.localStorage  = localStorageMock;
global.sessionStorage = sessionStorageMock;

// Patch crypto.randomUUID if not available (Node < 19 fallback)
// In Node 19+ crypto is read-only on global, so we patch the method directly.
if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
  vi.stubGlobal('crypto', {
    randomUUID: () => Math.random().toString(36).slice(2) + Date.now().toString(36),
  });
}

// ── Import controllers (after globals are set) ────────────────────────────────
import {
  filterByCategory,
  filterByPrice,
  deliveryController,
  authController,
  orderController,
} from './userController.js';

import {
  settingsController,
  productController,
  categoryController,
  inquiryController,
  dashboardController,
  adminOrderController,
} from '../controllers/adminController.js';

import { Store } from '../../js/store.js';

// ── Shared arbitrary ──────────────────────────────────────────────────────────
const arbProduct = fc.record({
  id:        fc.string({ minLength: 1 }),
  name:      fc.string(),
  category:  fc.string({ minLength: 1 }),
  price:     fc.float({ min: 0, max: 100000, noNaN: true }),
  available: fc.boolean(),
});

// ── Reset storage before each test to avoid pollution ────────────────────────
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// ═══════════════════════════════════════════════════════════════════════════════
// filterByCategory
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 4.1, 4.2, 4.3
 */
describe('filterByCategory', () => {
  it('Property 6: empty category list returns all products', () => {
    fc.assert(
      fc.property(fc.array(arbProduct), (products) => {
        const result = filterByCategory(products, []);
        expect(result.length).toBe(products.length);
        expect(result).toEqual(products);
      })
    );
  });

  it('Property 7: only matching products returned', () => {
    fc.assert(
      fc.property(
        fc.array(arbProduct, { minLength: 1 }),
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        (products, categoryIds) => {
          const result = filterByCategory(products, categoryIds);
          result.forEach(p => {
            expect(categoryIds).toContain(p.category);
          });
        }
      )
    );
  });

  it('Property 8: filterByCategory is idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(arbProduct),
        fc.array(fc.string({ minLength: 1 })),
        (products, categoryIds) => {
          const once  = filterByCategory(products, categoryIds);
          const twice = filterByCategory(once, categoryIds);
          expect(twice).toEqual(once);
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// filterByPrice
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 4.4
 */
describe('filterByPrice', () => {
  it('Property 9: results are within price bounds', () => {
    fc.assert(
      fc.property(
        fc.array(arbProduct),
        fc.float({ min: 0, max: 50000, noNaN: true }),
        fc.float({ min: 50000, max: 100000, noNaN: true }),
        (products, min, max) => {
          const result = filterByPrice(products, min, max);
          result.forEach(p => {
            expect(Number(p.price)).toBeGreaterThanOrEqual(min);
            expect(Number(p.price)).toBeLessThanOrEqual(max);
          });
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// deliveryController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 6.1, 6.2
 */
describe('deliveryController', () => {
  it('Property 12: free barangays receive fee 0', () => {
    const freeBarangays = deliveryController.getFreeBarangays();
    freeBarangays.forEach(b => {
      const info = deliveryController.getDeliveryInfo(b);
      expect(info.free).toBe(true);
      expect(info.fee).toBe(0);
    });
  });

  it('Property 13: non-free barangays receive a positive fee', () => {
    // Build a set of normalized free barangay names for filtering
    const freeSet = new Set(
      deliveryController.getFreeBarangays().map(b =>
        b.toLowerCase().replace(/^(barangay|brgy\.?|bgy\.?)\s*/i, '').trim()
      )
    );

    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => {
          const normalized = s.toLowerCase().replace(/^(barangay|brgy\.?|bgy\.?)\s*/i, '').trim();
          return normalized.length > 0 && !freeSet.has(normalized);
        }),
        (barangay) => {
          const info = deliveryController.getDeliveryInfo(barangay);
          expect(info.free).toBe(false);
          expect(info.fee).toBeGreaterThan(0);
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// authController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 3.4, 3.5, 3.6
 */
describe('authController', () => {
  it('Property 3: login rejects credentials not matching any registered user', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 6 }),
        (email, password) => {
          // Fresh storage — no users registered
          localStorageMock.clear();
          sessionStorageMock.clear();
          const result = authController.login({ email, password });
          expect(result.ok).toBe(false);
        }
      )
    );
  });

  it('Property 5: logout clears session (round-trip)', () => {
    localStorageMock.clear();
    sessionStorageMock.clear();

    const reg = authController.register({
      name:     'Test User',
      email:    'test@example.com',
      password: 'password123',
    });
    expect(reg.ok).toBe(true);
    expect(authController.isLoggedIn()).toBe(true);

    authController.logout();
    expect(authController.isLoggedIn()).toBe(false);
    expect(authController.currentUser()).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// settingsController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 13.1, 13.2
 */
describe('settingsController', () => {
  it('Property 20: save merges without data loss', () => {
    fc.assert(
      fc.property(
        fc.record({
          businessName: fc.string(),
          contactInfo:  fc.string(),
          address:      fc.string(),
        }),
        fc.record({
          businessName: fc.string(),
        }),
        (initial, partial) => {
          localStorageMock.clear();
          settingsController.save(initial);
          settingsController.save(partial);
          const result = settingsController.get();
          // Updated key reflects new value
          expect(result.businessName).toBe(partial.businessName);
          // Unmodified keys are preserved
          expect(result.contactInfo).toBe(initial.contactInfo);
          expect(result.address).toBe(initial.address);
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// productController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 8.1, 8.3
 */
describe('productController', () => {
  it('Property 15: save creates retrievable product', () => {
    fc.assert(
      fc.property(
        fc.record({
          name:      fc.string({ minLength: 1 }),
          price:     fc.float({ min: 0, max: 100000, noNaN: true }),
          category:  fc.string(),
          image:     fc.constant(''),
          available: fc.boolean(),
        }),
        (product) => {
          localStorageMock.clear();
          productController.save(product);
          const all   = productController.getAll();
          const found = all.find(p => p.name === product.name && p.price === product.price);
          expect(found).toBeDefined();
        }
      )
    );
  });

  it('Property 16: delete removes product', () => {
    fc.assert(
      fc.property(
        fc.record({
          name:      fc.string({ minLength: 1 }),
          price:     fc.float({ min: 0, max: 100000, noNaN: true }),
          category:  fc.string(),
          image:     fc.constant(''),
          available: fc.boolean(),
        }),
        (product) => {
          localStorageMock.clear();
          productController.save(product);
          const saved = productController.getAll()[0];
          expect(saved).toBeDefined();
          productController.delete(saved.id);
          const after = productController.getAll().find(p => p.id === saved.id);
          expect(after).toBeUndefined();
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// categoryController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 9.4
 */
describe('categoryController', () => {
  it('Property 17: category delete cascades to products', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            name:      fc.string({ minLength: 1 }),
            price:     fc.float({ min: 0, max: 100000, noNaN: true }),
            image:     fc.constant(''),
            available: fc.boolean(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (catName, productDefs) => {
          localStorageMock.clear();
          // Save category
          categoryController.save({ name: catName });
          const cat = categoryController.getAll()[0];
          expect(cat).toBeDefined();
          // Save products referencing this category
          productDefs.forEach(p => productController.save({ ...p, category: cat.id }));
          // Delete category — should cascade-clear product.category
          categoryController.delete(cat.id);
          // No product should still reference the deleted category id
          const stillReferencing = productController.getAll().filter(p => p.category === cat.id);
          expect(stillReferencing.length).toBe(0);
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// inquiryController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 12.2, 12.3
 */
describe('inquiryController', () => {
  it('Property 19: markRead then markUnread restores read=false', () => {
    fc.assert(
      fc.property(
        fc.record({
          name:      fc.string({ minLength: 1 }),
          phone:     fc.string({ minLength: 1 }),
          email:     fc.constant(''),
          subject:   fc.constant('Test'),
          message:   fc.string({ minLength: 1 }),
          timestamp: fc.constant(new Date().toISOString()),
        }),
        (inquiryData) => {
          localStorageMock.clear();
          // Seed an inquiry directly via Store
          const inquiry = { ...inquiryData, id: crypto.randomUUID(), read: false };
          Store.save(Store.KEYS.INQUIRIES, [inquiry]);

          inquiryController.markRead(inquiry.id);
          const afterRead = inquiryController.getAll().find(i => i.id === inquiry.id);
          expect(afterRead.read).toBe(true);

          inquiryController.markUnread(inquiry.id);
          const afterUnread = inquiryController.getAll().find(i => i.id === inquiry.id);
          expect(afterUnread.read).toBe(false);
        }
      )
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// dashboardController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates: Requirements 14.1, 14.2, 14.3
 */
describe('dashboardController', () => {
  it('Property 21: metrics.products equals productController.getAll().length', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name:      fc.string({ minLength: 1 }),
            price:     fc.float({ min: 0, max: 100000, noNaN: true }),
            category:  fc.constant('cat-1'),
            image:     fc.constant(''),
            available: fc.boolean(),
          }),
          { maxLength: 10 }
        ),
        (productDefs) => {
          localStorageMock.clear();
          productDefs.forEach(p => productController.save(p));
          const metrics = dashboardController.getMetrics();
          expect(metrics.products).toBe(productController.getAll().length);
        }
      )
    );
  });

  it('Property 21b: metrics.pendingOrders reflects pending order count', () => {
    localStorageMock.clear();
    sessionStorageMock.clear();

    // Register and log in a user so Orders.place works
    authController.register({ name: 'Dash Test', email: 'dash@test.com', password: 'pass123' });
    // register auto-logs in, so session is active

    // Save a product
    productController.save({ name: 'Widget', price: 100, category: 'cat-1', image: '', available: true });
    const product = productController.getAll()[0];

    // Place 2 orders (both start as pending)
    orderController.place({
      productId:    product.id,
      productName:  product.name,
      productPrice: product.price,
      quantity:     1,
      barangay:     'Talisay',
      address:      '',
      notes:        '',
    });
    orderController.place({
      productId:    product.id,
      productName:  product.name,
      productPrice: product.price,
      quantity:     1,
      barangay:     'Talisay',
      address:      '',
      notes:        '',
    });

    const metrics      = dashboardController.getMetrics();
    const allOrders    = adminOrderController.getAll();
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    expect(metrics.pendingOrders).toBe(pendingCount);
  });
});
