# Implementation Plan: React + Vite Migration — JUDY'S Mini Hardware

## Overview

Migrate the existing multi-page HTML/CSS/JS application to a React + Vite + Tailwind CSS SPA.
All existing logic is preserved; only the technology stack changes. The implementation proceeds
in layers: project setup → ES module adapters → controllers → shared components → user pages →
admin pages → routing/guards → cleanup → property tests.

## Tasks

- [x] 1. Project setup and configuration
  - Install `react-router-dom` and add it to `package.json` dependencies
  - Extend `tailwind.config.js` with custom color tokens: `forest` (#004B23), `green` (#008000), `growth` (#38B000), `dark` (#1a1a1a), `muted` (#555555), `light` (#F5F5F5), and update `content` to include `./src/**/*.{js,ts,jsx,tsx}`
  - Replace `src/index.css` with only the three Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) and no other rules
  - Add Font Awesome 6 CDN `<link>` to `index.html` and verify the `#root` mount point exists
  - Delete `src/App.css` (all styling will use Tailwind)
  - _Requirements: 1.1, 20.1, 20.2, 23.1, 23.2, 23.4_

- [x] 2. Adapt existing JS modules to ES module format
  - [x] 2.1 Convert `js/store.js` to an ES module
    - Replace the `if (typeof module !== 'undefined') module.exports` guard with `export { Store }`
    - Keep all existing IIFE logic intact; only change the export mechanism
    - _Requirements: 21.1_

  - [x] 2.2 Convert `js/auth.js` to an ES module
    - Add `import { Store } from './store.js'` at the top
    - Replace the CommonJS export guard with `export { Auth }`
    - _Requirements: 3.1–3.7, 21.1_

  - [x] 2.3 Convert `js/delivery.js` to an ES module
    - Add `export { Delivery }` replacing the CommonJS guard
    - _Requirements: 6.1–6.3_

  - [x] 2.4 Convert `js/orders.js` to an ES module
    - Add `import { Store } from './store.js'`, `import { Auth } from './auth.js'`, `import { Delivery } from './delivery.js'`
    - Replace the CommonJS export guard with `export { Orders }`
    - _Requirements: 5.1–5.5_

  - [x] 2.5 Convert `js/payment.js` to an ES module
    - Add `import { Store } from './store.js'`, `import { Orders } from './orders.js'`, `import { Auth } from './auth.js'`
    - Replace the CommonJS export guard with `export { Payment }`
    - _Requirements: 7.1–7.5_

  - [x] 2.6 Convert `js/seed.js` to an ES module
    - Add `import { Store } from './store.js'`
    - Export a `seedData` function and call it from `src/main.jsx` before mounting React
    - _Requirements: 21.2_

- [x] 3. Build `src/controllers/userController.js`
  - Import `Store`, `Auth`, `Orders`, `Payment`, `Delivery` from the adapted JS modules
  - Export `authController` wrapping all `Auth` methods (register, login, logout, currentUser, isLoggedIn, updateProfile)
  - Export `orderController` wrapping all `Orders` methods (place, cancel, getByUser, statusLabel, statusColor)
  - Export `paymentController` wrapping all `Payment` methods (submit, getByOrder, getByUser, getGcashConfig, statusLabel, statusColor)
  - Export `deliveryController` wrapping `Delivery.getDeliveryInfo` and `Delivery.getFreeBarangays`
  - Export `storeController` with `getSettings`, `getProducts`, `getCategories` reading from `Store`
  - Export pure functions `filterByCategory(products, categoryIds)` and `filterByPrice(products, min, max)` ported verbatim from `js/products.js`
  - _Requirements: 3.1–3.7, 4.1–4.6, 5.1–5.5, 6.1–6.3, 7.1–7.5, 16.2_

- [x] 4. Build `src/controllers/adminController.js`
  - Import `Store` from the adapted JS module
  - Export `adminAuthController` wrapping `AdminAuth`-equivalent logic (login, logout, isLoggedIn, currentAdmin) using `jh_admin_creds` / `jh_admin_session` keys
  - Export `productController` with `getAll`, `save` (create or update by id), `delete`
  - Export `categoryController` with `getAll`, `save`, `delete` (with cascade clear on products)
  - Export `adminOrderController` with `getAll`, `updateStatus`
  - Export `adminPaymentController` with `getAll`, `review` (sets status + reviewedAt), `saveGcashConfig`
  - Export `inquiryController` with `getAll`, `markRead`, `markUnread`, `delete`
  - Export `settingsController` with `get` and `save` (merges partial into existing settings)
  - Export `dashboardController` with `getMetrics` returning `{ products, categories, availableStock, totalOrders, pendingOrders, unreadMsgs, totalSales }`
  - _Requirements: 8.1–8.4, 9.1–9.4, 10.1–10.3, 11.1–11.4, 12.1–12.5, 13.1–13.3, 14.1–14.3_

- [x] 5. Checkpoint — Verify controllers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Build shared components
  - [x] 6.1 Create `src/components/Modal.jsx`
    - Accept `{ open, onClose, title, children }` props
    - Render a fixed overlay; close on backdrop click and Escape key (`useEffect` for keydown listener)
    - Slide up from bottom on mobile (`sm:` breakpoint), centered on desktop
    - _Requirements: 17.1–17.5_

  - [x] 6.2 Create `src/components/ProductCard.jsx`
    - Accept `{ product, onBuyNow }` props
    - Display product image (`loading="lazy"`), name, price (formatted with `toLocaleString`), and availability badge
    - "Details" link navigates to `/products/:id` via React Router `<Link>`
    - "Buy Now" button calls `onBuyNow(product)`
    - _Requirements: 18.1–18.3_

  - [x] 6.3 Create `src/components/Navbar.jsx`
    - No props — reads auth state from `authController.currentUser()` on render
    - Sticky top, `bg-[#004B23]` background
    - Hamburger button on mobile (`md:hidden`), full nav links on desktop
    - Toggle mobile menu with `useState`; highlight active route with `useLocation`
    - Show user's first name + `/account` link when logged in; "Sign In" button to `/login` when not
    - _Requirements: 15.1–15.6_

  - [x] 6.4 Create `src/components/Footer.jsx`
    - Load `contactInfo` from `storeController.getSettings()` via `useEffect`
    - Three-column grid on `lg:`, stacked on mobile: brand column, quick links column, contact column
    - _Requirements: 16.1–16.3_

  - [x] 6.5 Create `src/components/BuyNowModal.jsx`
    - Accept `{ product, open, onClose }` props
    - Use `Modal` as the overlay wrapper
    - Controlled form state: qty, barangay, address, notes, paymentMethod, proofImage
    - Show delivery fee preview (subtotal + fee + total) via `deliveryController.getDeliveryInfo` on barangay input
    - Toggle GCash panel (account name, number, QR code) when GCash radio is selected
    - On submit: call `orderController.place()`, then `paymentController.submit()` for GCash orders (FileReader for proof image)
    - Show inline errors for missing barangay, invalid qty, and missing GCash proof
    - Show success message after placement; redirect unauthenticated users to `/login`
    - _Requirements: 5.1, 5.4, 5.5, 7.3, 7.4, 22.4_

  - [x] 6.6 Create `src/components/Sidebar.jsx`
    - Accept `{ activePage }` prop
    - Render nav links with active highlight matching `activePage`
    - Hidden on mobile (`hidden md:block`); hamburger drawer handled by `AdminLayout`
    - Logout link calls `adminAuthController.logout()` then navigates to `/admin/login`
    - _Requirements: 19.2, 19.4, 19.5_

  - [x] 6.7 Create `src/components/AdminLayout.jsx`
    - Accept `{ children, activePage }` props
    - Render `grid md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]`
    - Include `<Sidebar activePage={activePage} />` and an admin top navbar
    - Hamburger button opens sidebar as slide-in drawer overlay on mobile (`useState` for drawer open/close)
    - Wrap `children` in `<main className="bg-gray-100 p-4 md:p-6 lg:p-8">`
    - _Requirements: 19.1–19.3_

- [x] 7. Build user-facing pages
  - [x] 7.1 Create `src/pages/Home.jsx`
    - `useEffect` loads categories and first 4 products from `storeController`
    - Render category cards linking to `/products?category=<id>`
    - Render `<ProductCard>` components for featured products with `onBuyNow` prop
    - Control `<BuyNowModal>` with `useState({ open, product })`
    - Load store address and contact from `storeController.getSettings()` for hero/footer sections
    - _Requirements: 1.2, 4.6, 15.1, 16.1, 18.1–18.3_

  - [x] 7.2 Create `src/pages/Products.jsx`
    - `useSearchParams` reads `?category=` to pre-select category filter
    - `useState` for `checkedCategories`, `priceMin`, `priceMax`, `sidebarOpen`
    - Load categories and products via `storeController` in `useEffect`
    - Apply `filterByCategory` and `filterByPrice` from `userController` to derive displayed products
    - Render `<ProductCard>` grid and filter sidebar; sidebar toggle on mobile
    - Control `<BuyNowModal>` with `useState`
    - _Requirements: 1.2, 4.1–4.6, 15.1, 18.1–18.3_

  - [x] 7.3 Create `src/pages/ProductDetail.jsx`
    - `useParams` reads `:id`; `useEffect` loads product, category, and related products
    - Redirect to `/products` if product not found
    - `useState` for `mainImage`, `orderModalOpen`
    - Render image gallery with thumbnail switching, specs table, delivery info section
    - Render `<BuyNowModal>` for order placement; redirect unauthenticated users to `/login?next=...`
    - _Requirements: 1.2, 5.4, 18.2, 21.3, 22.1_

  - [x] 7.4 Create `src/pages/Login.jsx`
    - Controlled form: email, password
    - On submit: call `authController.login()`; show inline error on failure
    - On success: navigate to `?next` param or `/` using `useSearchParams` + `useNavigate`
    - _Requirements: 1.2, 3.3, 3.4, 22.2_

  - [x] 7.5 Create `src/pages/Register.jsx`
    - Controlled form: name, email, password
    - On submit: call `authController.register()`; show inline error on failure (duplicate email, short password)
    - On success: navigate to `/account`
    - _Requirements: 1.2, 3.1, 3.2, 22.2_

  - [x] 7.6 Create `src/pages/Account.jsx`
    - `useEffect` calls `authController.requireAuth()` redirect on mount
    - `useState` for `activeTab` ('orders' | 'profile'), `orders`
    - Orders tab: load `orderController.getByUser(user.id)`, display with status labels and cancel button
    - Profile tab: controlled name/password form calling `authController.updateProfile()`
    - _Requirements: 1.2, 2.1, 2.2, 3.5, 3.7, 5.2, 5.3_

  - [x] 7.7 Create `src/pages/Contact.jsx`
    - Load store address and contact from `storeController.getSettings()` via `useEffect`
    - Pre-fill message from `?product=` query param via `useSearchParams`
    - Controlled form: name, phone, message; validate and save inquiry to `Store` on submit
    - Show inline errors and success message
    - _Requirements: 1.2, 22.2_

  - [x] 7.8 Create `src/pages/About.jsx`
    - Static page with store information, mission, and team sections
    - Load store settings for contact/address display
    - _Requirements: 1.2_

- [x] 8. Build admin pages
  - [x] 8.1 Create `src/pages/admin/AdminLogin.jsx`
    - Controlled form: username, password
    - On submit: call `adminAuthController.login()`; show inline error on failure
    - On success: navigate to `/admin`
    - _Requirements: 1.3_

  - [x] 8.2 Create `src/pages/admin/AdminDashboard.jsx`
    - Wrap with `<AdminLayout activePage="dashboard">`
    - `useEffect` calls `dashboardController.getMetrics()` and loads 5 most recent orders
    - Render metric cards and recent orders table
    - _Requirements: 1.3, 14.1–14.3_

  - [x] 8.3 Create `src/pages/admin/AdminProducts.jsx`
    - Wrap with `<AdminLayout activePage="products">`
    - `useState` for `products`, `categories`, `modalOpen`, `editingProduct`
    - `useEffect` loads products and categories from controllers
    - Render products table with Edit/Delete buttons
    - Add/Edit modal uses `<Modal>`; form includes image file upload via `FileReader` API (base64)
    - On save: call `productController.save()`; on delete: call `productController.delete()`
    - _Requirements: 1.3, 8.1–8.4_

  - [x] 8.4 Create `src/pages/admin/AdminCategories.jsx`
    - Wrap with `<AdminLayout activePage="categories">`
    - `useState` for `categories`, `editingCategory`, `pendingIcon`
    - Render categories table with product count; icon upload via `FileReader`
    - On save: call `categoryController.save()`; on delete: call `categoryController.delete()` (cascade)
    - _Requirements: 1.3, 9.1–9.4_

  - [x] 8.5 Create `src/pages/admin/AdminOrders.jsx`
    - Wrap with `<AdminLayout activePage="orders">`
    - `useState` for `orders`, `filter` (all/pending/confirmed/cancelled)
    - `useEffect` loads all orders from `adminOrderController.getAll()`
    - Render filterable orders table; status update calls `adminOrderController.updateStatus()`
    - _Requirements: 1.3, 10.1–10.3_

  - [x] 8.6 Create `src/pages/admin/AdminPayments.jsx`
    - Wrap with `<AdminLayout activePage="payments">`
    - `useState` for `payments`, `filter`, `lightboxSrc`, `lightboxOpen`
    - Render stats (pending/approved/rejected counts), filter tabs, and payments table
    - Approve/reject buttons call `adminPaymentController.review()`; re-fetch after action
    - Clicking proof image thumbnail opens lightbox (`useState` for lightbox src/open)
    - _Requirements: 1.3, 11.1–11.4_

  - [x] 8.7 Create `src/pages/admin/AdminInquiries.jsx`
    - Wrap with `<AdminLayout activePage="inquiries">`
    - `useState` for `inquiries`, `filter`, `selectedInquiry`
    - Two-column layout: inquiry list (left) + detail panel (right)
    - Clicking an inquiry calls `inquiryController.markRead()` and sets `selectedInquiry`
    - Detail panel shows full inquiry with Mark Read/Unread and Delete buttons
    - _Requirements: 1.3, 12.1–12.5_

  - [x] 8.8 Create `src/pages/admin/AdminSettings.jsx`
    - Wrap with `<AdminLayout activePage="settings">`
    - Four separate controlled forms: Store Info, Business Hours, Delivery Settings, Admin Credentials
    - GCash form includes name, number, and QR image upload via `FileReader`; show QR preview
    - Each form calls `settingsController.save(partial)` on submit; show success feedback
    - _Requirements: 1.3, 13.1–13.3_

- [x] 9. Wire up `src/App.jsx` with React Router and auth guards
  - Define `AuthGuard` component: checks `authController.isLoggedIn()`; redirects to `/login?next=<current-path>` if false
  - Define `AdminAuthGuard` component: checks `adminAuthController.isLoggedIn()`; redirects to `/admin/login` if false
  - Define all user routes: `/`, `/products`, `/products/:id`, `/login`, `/register`, `/contact`, `/about`, `/account` (wrapped in `AuthGuard`)
  - Define all admin routes: `/admin/login`, `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/payments`, `/admin/inquiries`, `/admin/settings` (all except `/admin/login` wrapped in `AdminAuthGuard`)
  - Add a catch-all `<Route path="*" element={<Navigate to="/" />} />` for unknown paths
  - Update `src/main.jsx` to call `seedData()` before `ReactDOM.createRoot`
  - _Requirements: 1.1–1.5, 2.1–2.5_

- [x] 10. Checkpoint — Verify routing and auth guards
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Remove legacy files
  - Delete all `.html` files at the root level: `index.html` content replaced by Vite's `index.html` (keep the Vite entry), `about.html`, `account.html`, `contact.html`, `login.html`, `product-detail.html`, `products.html`, `register.html`
  - Delete the `admin/` HTML directory and all files within it
  - Delete the `css/` directory (`css/admin.css`, `css/components.css`, `css/main.css`)
  - Delete `src/App.css` if not already removed in task 1
  - _Requirements: 20.1_

- [x] 12. Property-based tests with Vitest + fast-check
  - Install `vitest` and `@fast-check/vitest` (or `fast-check`) as dev dependencies; add a `test` script to `package.json` (`vitest --run`)
  - Create `src/controllers/userController.test.js` (or `.test.jsx`) as the test file

  - [x] 12.1 Write property test for filterByCategory — empty list returns all (Property 6)
    - Use `fc.array(fc.record({ id: fc.string(), category: fc.string(), price: fc.float() }))` as arbitrary products
    - Assert `filterByCategory(products, []).length === products.length`
    - **Property 6: filterByCategory with empty list returns all products**
    - **Validates: Requirements 4.1**

  - [x]* 12.2 Write property test for filterByCategory — only matching products returned (Property 7)
    - Generate arbitrary products and a non-empty category list
    - Assert every returned product's `category` is in the selected list
    - **Property 7: filterByCategory returns only matching products**
    - **Validates: Requirements 4.2**

  - [x]* 12.3 Write property test for filterByCategory — idempotent (Property 8)
    - Apply `filterByCategory` twice with the same category list; assert result equals single application
    - **Property 8: filterByCategory is idempotent**
    - **Validates: Requirements 4.3**

  - [x]* 12.4 Write property test for filterByPrice — results within bounds (Property 9)
    - Generate products with arbitrary prices and a valid `[min, max]` range
    - Assert every returned product's price satisfies `price >= min && price <= max`
    - **Property 9: filterByPrice returns products within bounds**
    - **Validates: Requirements 4.4**

  - [x]* 12.5 Write property test for deliveryController — free barangays get fee 0 (Property 12)
    - For each barangay in `deliveryController.getFreeBarangays()`, assert `getDeliveryInfo(b).fee === 0` and `getDeliveryInfo(b).free === true`
    - **Property 12: Free barangays receive free delivery**
    - **Validates: Requirements 6.1**

  - [x]* 12.6 Write property test for deliveryController — non-free barangays get positive fee (Property 13)
    - Generate arbitrary barangay strings that are not in the free list
    - Assert `getDeliveryInfo(b).free === false` and `getDeliveryInfo(b).fee > 0`
    - **Property 13: Non-free barangays receive a positive delivery fee**
    - **Validates: Requirements 6.2**

  - [x]* 12.7 Write property test for authController — login rejects invalid credentials (Property 3)
    - Generate arbitrary email/password pairs not matching any registered user
    - Assert `authController.login({ email, password }).ok === false`
    - **Property 3: Login rejects invalid credentials**
    - **Validates: Requirements 3.4**

  - [x]* 12.8 Write property test for authController — logout clears session (Property 5)
    - Register a user, log in, call logout, assert `isLoggedIn() === false` and `currentUser() === null`
    - **Property 5: Logout clears session (round-trip)**
    - **Validates: Requirements 3.5, 3.6**

  - [x]* 12.9 Write property test for settingsController — save merges without data loss (Property 20)
    - Generate an initial settings object and a partial update with a subset of keys
    - Call `settingsController.save(partial)`, then assert `settingsController.get()` contains both the updated keys and the original unmodified keys
    - **Property 20: Settings save merges without data loss**
    - **Validates: Requirements 13.1, 13.2**

  - [x]* 12.10 Write property test for productController — save creates retrievable product (Property 15)
    - Generate a valid product object with no existing id
    - Call `productController.save(product)`, assert the product appears in `productController.getAll()`
    - **Property 15: Product save creates retrievable product**
    - **Validates: Requirements 8.1**

  - [x]* 12.11 Write property test for productController — delete removes product (Property 16)
    - Save a product, then call `productController.delete(id)`, assert no product with that id in `getAll()`
    - **Property 16: Product delete removes product**
    - **Validates: Requirements 8.3**

  - [x]* 12.12 Write property test for categoryController — delete cascades to products (Property 17)
    - Save a category and products referencing it; delete the category; assert all affected products have `category === ''`
    - **Property 17: Category delete cascades to products**
    - **Validates: Requirements 9.4**

  - [x]* 12.13 Write property test for inquiryController — markRead/markUnread round-trip (Property 19)
    - Save an inquiry, call `markRead`, then `markUnread`, assert `read === false`
    - **Property 19: Inquiry markRead / markUnread round-trip**
    - **Validates: Requirements 12.2, 12.3**

  - [x]* 12.14 Write property test for dashboardController — metrics reflect current data (Property 21)
    - After saving N products, assert `dashboardController.getMetrics().products === productController.getAll().length`
    - After updating an order to non-pending, assert `pendingOrders` count decreases accordingly
    - **Property 21: Dashboard metrics reflect current data**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests and property tests are complementary — both should be run with `vitest --run`
- The `js/` directory modules are adapted in-place (tasks 2.x) so they can be imported by both controllers; the original files are not deleted
- `js/seed.js` is called once from `src/main.jsx` before React mounts to ensure localStorage is populated on first visit
