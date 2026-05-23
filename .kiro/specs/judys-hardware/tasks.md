# Implementation Plan

- [x] 1. Set up project structure and shared utilities


  - Create all directories: `css/`, `js/`, `js/admin/`, `admin/`, `tests/`
  - Create `js/store.js` with `Store.getAll`, `Store.save`, `Store.getSettings`, `Store.saveSettings`, `Store.generateId`
  - Create `js/seed.js` with default categories (Tools, Construction Materials, Electrical Supplies, Plumbing), sample products, and default settings; seed only if localStorage is empty
  - _Requirements: 7.3, 8.3, 10.2_



- [ ] 1.1 Write property test for Store round trips (Properties 1, 2, 3, 7, 8)
  - Create `tests/properties.html` loading fast-check via CDN
  - **Property 1: Product add round trip** — Validates: Requirements 7.3
  - **Property 2: Product delete removes item** — Validates: Requirements 7.6
  - **Property 3: Product edit round trip** — Validates: Requirements 7.4, 7.5


  - **Property 7: Whitespace/empty fields rejected** — Validates: Requirements 5.3
  - **Property 8: Settings round trip** — Validates: Requirements 10.2

- [ ] 2. Create global CSS (color system, typography, reusable components)
  - Create `css/main.css` with CSS custom properties (`--deep-forest`, `--hardware-green`, `--vibrant-growth`, `--white`, `--light-gray`, `--transition: 0.3s ease`)


  - Add base reset, typography, and layout utilities
  - Create `css/components.css` with styles for: navbar, buttons (base + hover glow), product cards (hover border + shadow), category cards (hover glow), Available Today badge, footer


  - All hover transitions use `var(--transition)` (0.3s ease)
  - _Requirements: 1.1, 1.3, 1.5, 2.7, 3.2, 12.1, 12.2, 12.3_



- [ ] 3. Build the Navbar and shared nav behavior
  - Create `js/nav.js` that injects the sticky navbar HTML into every page and handles hamburger toggle (adds/removes `.nav-open` class with 0.3s transition)
  - _Requirements: 1.1, 11.2, 11.3_



- [ ] 4. Build the Home page (`index.html`)
  - Create `index.html` with: sticky navbar, hero section (headline, subtext, Shop Now CTA), featured categories grid (4 cards), featured products grid, store info section, CTA banner, footer


  - Create `js/home.js` to dynamically render featured products from localStorage and load settings (address, contact) into the store info section
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9_

- [x] 5. Build the Products page (`products.html`) with filtering


  - Create `products.html` with sidebar filter (category checkboxes + price range inputs) and product grid


  - Create `js/products.js` to: load categories into sidebar, render all products, apply `filterByCategory` and `filterByPrice` functions on filter change
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_



- [ ] 5.1 Write property tests for filter functions (Properties 4, 5)
  - Add to `tests/properties.html`
  - **Property 4: Category filter narrows results** — Validates: Requirements 2.4


  - **Property 5: Price range filter bounds** — Validates: Requirements 2.5



- [ ] 6. Build the Product Detail page (`product-detail.html`)
  - Create `product-detail.html` and `js/product-detail.js` to: read product id from URL query param, load product from localStorage, render large image, name, price, description, availability, Available Today badge, and "Contact to Order" / "Ask About This Product" button
  - If product id is missing or not found, redirect to `products.html`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_



- [x] 6.1 Write property test for Available Today badge (Property 9)


  - Add to `tests/properties.html`
  - **Property 9: Available Today badge iff available** — Validates: Requirements 3.2



- [ ] 7. Build the About page (`about.html`)
  - Create `about.html` with store story, mission/vision section, and a store image placeholder
  - _Requirements: 4.1_



- [x] 8. Build the Contact page (`contact.html`) with form validation


  - Create `contact.html` with contact form (name, email, subject, message), phone/hours display, and Google Maps embed placeholder
  - Create `js/contact.js` with `validateInquiry(data)` function (rejects empty/whitespace fields), form submission handler that saves to `jh_inquiries` in localStorage and shows success message
  - _Requirements: 5.1, 5.2, 5.3, 5.4_



- [x] 8.1 Write property tests for inquiry validation and persistence (Properties 6, 7)


  - Add to `tests/properties.html`
  - **Property 6: Inquiry submission round trip** — Validates: Requirements 5.2
  - **Property 7: Whitespace/empty fields rejected** — Validates: Requirements 5.3




- [ ] 9. Build the Admin Dashboard (`admin/index.html`)
  - Create `admin/index.html` with overview cards (Total Products, Categories, Messages) and sidebar navigation links to all admin sections
  - Create `js/admin/dashboard.js` to read counts from localStorage and populate cards
  - Create `css/admin.css` with admin sidebar, card, and table styles
  - _Requirements: 6.1, 6.2, 6.3_



- [ ] 9.1 Write property test for dashboard counts (Property 11)
  - Add to `tests/properties.html`
  - **Property 11: Dashboard counts reflect data state** — Validates: Requirements 6.1

- [ ] 10. Build Admin Product Management (`admin/products.html`)
  - Create `admin/products.html` with product list table and Add/Edit modal form (name, price, category select, image upload, description, availability toggle)
  - Create `js/admin/products.js` with add, edit (pre-fill form), and delete handlers that read/write `jh_products` in localStorage and re-render the list immediately
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 11. Build Admin Category Management (`admin/categories.html`)
  - Create `admin/categories.html` with category list and Add/Edit/Delete controls
  - Create `js/admin/categories.js` with add, edit, and delete handlers; on delete, update any products with that category id (set category to empty string or "Uncategorized")
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11.1 Write property tests for category CRUD and cascade delete (Properties 10)
  - Add to `tests/properties.html`
  - **Property 10: Category delete propagates to products** — Validates: Requirements 8.5

- [ ] 12. Build Admin Customer Inquiries (`admin/inquiries.html`)
  - Create `admin/inquiries.html` with inquiry list showing sender name, email, subject; unread items visually highlighted
  - Create `js/admin/inquiries.js` with click handler that marks inquiry as read in localStorage and renders full message details
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12.1 Write property test for inquiry read status (Property 12)
  - Add to `tests/properties.html`
  - **Property 12: Inquiry read status after click** — Validates: Requirements 9.2, 9.3

- [ ] 13. Build Admin Website Settings (`admin/settings.html`)
  - Create `admin/settings.html` with editable fields for business name, contact info, and address
  - Create `js/admin/settings.js` that loads current settings from localStorage on page load and saves updated values on form submit; public pages read from `jh_settings` to display current info
  - _Requirements: 10.1, 10.2_

- [ ] 14. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 17. Build Payment Method UI on Product Detail and Checkout


  - Update `product-detail.html` and `js/product-detail.js` to show a payment method selector (Cash / GCash) in the order flow
  - WHEN GCash is selected, display GCash name ("Judy Hardware"), GCash number, and QR code image
  - WHEN Cash is selected, display in-store payment instructions
  - _Requirements: 13.1, 13.2, 13.3, 13.4_



- [ ] 18. Build Payment Proof Submission Form
  - Add a payment proof form (after order placement) with fields: name, product ordered, amount paid, image upload (required for GCash)
  - Wire form to `Payment.submit()` in `js/payment.js`; on success show "Payment submitted. Please wait for confirmation."
  - Validate all required fields and enforce image upload for GCash before submission


  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_



- [ ] 18.1 Write property tests for payment submission (Properties 13, 14)
  - Add to `tests/properties.html`
  - **Property 13: Payment proof submission round trip** — Validates: Requirements 14.2, 14.5
  - **Property 14: GCash proof image required** — Validates: Requirements 14.3

- [ ] 19. Build Admin Payment Verification page (`admin/payments.html`)
  - Complete `admin/payments.html` with a table listing all payments: customer name, product, amount, method, date, status


  - Display the uploaded receipt screenshot for each payment record
  - Add Approve and Reject buttons that call `Payment.review()` and re-render the list



  - Show delivery fee and barangay alongside each record
  - Create `js/admin/payments.js` to load, render, and handle approve/reject actions
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 16.1, 16.3, 16.4_



- [ ] 19.1 Write property tests for payment review (Properties 15, 16)
  - Add to `tests/properties.html`
  - **Property 15: Payment approval updates order status** — Validates: Requirements 15.4
  - **Property 16: Payment rejection updates order status** — Validates: Requirements 15.5

- [ ] 20. Build Delivery Confirmation in Admin Orders/Payments
  - After a payment is approved, show a "Confirm Delivery" button on the payment/order record
  - Wire button to `Orders.updateStatus(orderId, 'confirmed')`
  - _Requirements: 16.1, 16.2_

- [ ] 20.1 Write property test for delivery fee logic (Property 17)
  - Add to `tests/properties.html`
  - **Property 17: Delivery fee correctness** — Validates: Requirements 16.3

- [ ] 21. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.
  - Ensure all internal links between pages work correctly (navbar, "View Details" → product-detail, "Shop Now" → products, admin sidebar links)
  - Verify seed data loads correctly on first visit
  - Confirm mobile hamburger menu works on all pages
  - Confirm all hover animations (buttons, cards) use 0.3s transitions
  - _Requirements: 1.1, 2.1, 11.1, 11.2, 11.3, 12.1, 12.2, 12.3_
