# Design Document — JUDY'S Mini Hardware Website

## Overview

JUDY'S Mini Hardware is a fully frontend-only, multi-page website built with plain HTML, CSS, and vanilla JavaScript. No framework or build tool is required. All persistent data (products, categories, inquiries, settings) is stored in the browser's `localStorage`. The site has two distinct areas: a public customer-facing section and a password-protected admin panel.

---

## Architecture

```
judys-hardware/
├── index.html            # Home page
├── products.html         # Products listing
├── product-detail.html   # Single product detail
├── about.html            # About page
├── contact.html          # Contact page
├── admin/
│   ├── index.html        # Admin dashboard
│   ├── products.html     # Product management
│   ├── categories.html   # Category management
│   ├── inquiries.html    # Customer inquiries
│   ├── payments.html     # Payment verification
│   └── settings.html     # Website settings
├── css/
│   ├── main.css          # Global styles, color variables, typography
│   ├── components.css    # Reusable components (cards, buttons, badges, navbar)
│   └── admin.css         # Admin-specific styles
└── js/
    ├── store.js          # localStorage CRUD helpers
    ├── seed.js           # Default seed data (products, categories, settings)
    ├── nav.js            # Navbar / hamburger menu behavior
    ├── home.js           # Home page dynamic rendering
    ├── products.js       # Products page filtering + rendering
    ├── product-detail.js # Product detail page rendering
    ├── contact.js        # Contact form validation + submission
    ├── auth.js           # User auth (register/login/logout)
    ├── orders.js         # Order placement and status management
    ├── payment.js        # Payment proof submission and admin review
    ├── delivery.js       # Delivery fee logic (free barangays)
    ├── buy-now.js        # Shared Buy Now overlay (order modal)
    ├── admin/
    │   ├── dashboard.js  # Dashboard stats
    │   ├── products.js   # Admin product CRUD
    │   ├── categories.js # Admin category CRUD
    │   ├── inquiries.js  # Inquiry read/view
    │   ├── payments.js   # Admin payment verification UI
    │   └── settings.js   # Settings save/load
```

All pages share `css/main.css` and `css/components.css`. Admin pages additionally load `css/admin.css`.

---

## Components and Interfaces

### Color System (CSS Custom Properties)

```css
:root {
  --deep-forest:    #004B23;
  --hardware-green: #008000;
  --vibrant-growth: #38B000;
  --white:          #FFFFFF;
  --light-gray:     #F5F5F5;
  --transition:     0.3s ease;
}
```

### Navbar
- Sticky, Deep Forest background
- Logo left, nav links center/right, "View Products" button
- Collapses to hamburger (☰) below 768px
- Hamburger toggles `.nav-open` class with 0.3s transition

### Buttons
- Base: `background: var(--hardware-green)`, white text, border-radius 6px
- Hover: `background: var(--vibrant-growth)`, box-shadow glow
- Transition: `all var(--transition)`

### Product Card
- White background, subtle shadow
- Image top, name + price + button below
- Hover: `border: 2px solid var(--vibrant-growth)`, elevated shadow

### Category Card
- Icon + label
- Hover: `box-shadow: 0 0 0 3px var(--vibrant-growth)`

### Available Today Badge
- `background: var(--vibrant-growth)`, white text, small pill shape
- Shown only when `product.available === true`

### Admin Sidebar
- Fixed left sidebar on desktop, collapsible on mobile
- Deep Forest background, white links

---

## Data Models

All data lives in `localStorage` under these keys:

### `jh_products` — Array of Product objects
```json
{
  "id": "string (UUID)",
  "name": "string",
  "price": "number",
  "category": "string (category id)",
  "image": "string (base64 or URL)",
  "description": "string",
  "available": "boolean"
}
```

### `jh_categories` — Array of Category objects
```json
{
  "id": "string (UUID)",
  "name": "string"
}
```

### `jh_inquiries` — Array of Inquiry objects
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "read": "boolean",
  "timestamp": "string (ISO date)"
}
```

### `jh_settings` — Single Settings object
```json
{
  "businessName": "string",
  "contactInfo": "string",
  "address": "string"
}
```

### `jh_orders` — Array of Order objects
```json
{
  "id": "string (UUID)",
  "userId": "string",
  "userName": "string",
  "userEmail": "string",
  "productId": "string",
  "productName": "string",
  "productPrice": "number",
  "quantity": "number",
  "barangay": "string",
  "address": "string",
  "deliveryFee": "number",
  "deliveryFree": "boolean",
  "totalPrice": "number",
  "notes": "string",
  "status": "string ('pending' | 'payment_pending' | 'paid' | 'payment_rejected' | 'confirmed' | 'cancelled')",
  "createdAt": "string (ISO date)"
}
```

### `jh_payments` — Array of Payment objects
```json
{
  "id": "string (UUID)",
  "orderId": "string",
  "userId": "string",
  "userName": "string",
  "userEmail": "string",
  "productName": "string",
  "amountPaid": "number",
  "paymentMethod": "string ('cash' | 'gcash')",
  "proofImage": "string (base64) | null",
  "notes": "string",
  "status": "string ('pending' | 'approved' | 'rejected')",
  "createdAt": "string (ISO date)",
  "reviewedAt": "string (ISO date) | null"
}
```

### `store.js` Interface
```js
Store.getAll(key)           // returns parsed array or []
Store.save(key, array)      // JSON.stringify and set
Store.getSettings()         // returns jh_settings object
Store.saveSettings(obj)     // saves settings object
Store.generateId()          // returns crypto.randomUUID() or fallback
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Prework summary:** After analyzing all 12 requirements and their acceptance criteria, 12 testable properties were identified. After property reflection, redundant count-based properties (7.1, 8.1, 9.1) were subsumed by their corresponding round-trip properties. Edit pre-fill and save (7.4 + 7.5) were merged into a single edit round-trip property. Read status properties (9.2 + 9.3) were merged. This yields 12 consolidated, non-redundant properties below.

---

Property 1: Product add round trip
*For any* valid product object, after saving it via the admin add-product flow, `Store.getAll('jh_products')` should return an array containing an object with the same id, name, price, category, description, and available fields.
**Validates: Requirements 7.3**

Property 2: Product delete removes item
*For any* product list and any product in that list, after calling the delete operation with that product's id, `Store.getAll('jh_products')` should return an array that does not contain any item with that id.
**Validates: Requirements 7.6**

Property 3: Product edit round trip
*For any* existing product and any set of updated field values, after saving the edit, `Store.getAll('jh_products')` should return an array containing exactly one item with that id whose fields match the updated values.
**Validates: Requirements 7.4, 7.5**

Property 4: Category filter narrows results
*For any* product list and any selected category id, the result of `filterByCategory(products, categoryId)` should be a subset of the original list where every item's category field equals the selected category id.
**Validates: Requirements 2.4**

Property 5: Price range filter bounds
*For any* product list and any min/max price pair where min ≤ max, every product returned by `filterByPrice(products, min, max)` should have a price ≥ min and ≤ max.
**Validates: Requirements 2.5**

Property 6: Inquiry submission round trip
*For any* valid inquiry object (non-empty name, email, subject, message), after the contact form saves it, `Store.getAll('jh_inquiries')` should return an array containing an inquiry with the same name, email, subject, and message values.
**Validates: Requirements 5.2**

Property 7: Whitespace/empty fields rejected
*For any* contact form submission where at least one required field (name, email, subject, message) is empty or composed entirely of whitespace characters, `validateInquiry(data)` should return false and no new inquiry should be written to localStorage.
**Validates: Requirements 5.3**

Property 8: Settings round trip
*For any* settings object with businessName, contactInfo, and address fields, after calling `Store.saveSettings(obj)`, calling `Store.getSettings()` immediately after should return an object with identical field values.
**Validates: Requirements 10.2**

Property 9: Available Today badge iff available
*For any* product object, `renderAvailableBadge(product)` should return a truthy/visible badge element if and only if `product.available === true`, and should return nothing/hidden otherwise.
**Validates: Requirements 3.2**

Property 10: Category delete propagates to products
*For any* category id that is deleted via the admin delete-category flow, no product returned by `Store.getAll('jh_products')` should have a category field equal to that deleted category id.
**Validates: Requirements 8.5**

Property 11: Dashboard counts reflect data state
*For any* state of localStorage, the dashboard overview cards should display a total products count equal to `Store.getAll('jh_products').length`, a categories count equal to `Store.getAll('jh_categories').length`, and a messages count equal to `Store.getAll('jh_inquiries').length`.
**Validates: Requirements 6.1**

Property 12: Inquiry read status after click
*For any* inquiry in the list, after the admin clicks on that inquiry, `Store.getAll('jh_inquiries')` should return that inquiry with `read === true`, and the UI should visually distinguish it from unread inquiries.
**Validates: Requirements 9.2, 9.3**

---

Property 13: Payment proof submission round trip
*For any* valid payment proof submission (non-empty name, product, amount, and a GCash proof image), after calling `Payment.submit(data)`, `Store.getAll('jh_payments')` should return an array containing a payment record with matching userName, productName, amountPaid, paymentMethod, and a status of "pending".
**Validates: Requirements 14.2, 14.5**

Property 14: GCash proof image required
*For any* payment submission where `paymentMethod === 'gcash'` and `proofImage` is null or empty, `Payment.submit(data)` should return `{ ok: false }` and no new record should be written to `jh_payments`.
**Validates: Requirements 14.3**

Property 15: Payment approval updates order status
*For any* payment record with status "pending", after calling `Payment.review(paymentId, 'approved')`, the payment record in `jh_payments` should have status "approved" and the associated order in `jh_orders` should have status "paid".
**Validates: Requirements 15.4**

Property 16: Payment rejection updates order status
*For any* payment record with status "pending", after calling `Payment.review(paymentId, 'rejected')`, the payment record in `jh_payments` should have status "rejected" and the associated order in `jh_orders` should have status "payment_rejected".
**Validates: Requirements 15.5**

Property 17: Delivery fee correctness
*For any* barangay string, `Delivery.getDeliveryInfo(barangay).fee` should equal 0 when the normalized barangay name is "talisay" or "pangasihan", and should equal the default fee (80) for all other non-empty barangay strings.
**Validates: Requirements 16.3**

---

## Error Handling

- Contact form: inline field-level error messages, no submission until all fields valid
- Admin forms: required field validation before localStorage write
- localStorage unavailable: graceful fallback with console warning, UI shows empty state
- Missing product id in URL: product-detail page redirects to products.html
- Image upload: only base64 data URLs stored; invalid files show an error message

---

## Testing Strategy

### Unit Tests (Vanilla JS, no framework needed)
Test specific examples and edge cases for `store.js` functions:
- `Store.getAll` returns `[]` when key is absent
- `Store.save` then `Store.getAll` returns the saved array
- `Store.generateId` returns a non-empty string
- Contact form validation rejects empty fields
- Price filter correctly excludes out-of-range products

### Property-Based Tests
Using **fast-check** (loaded via CDN in a test HTML file, `tests/properties.html`) to verify universal properties.

Each property-based test runs a minimum of 100 iterations.

Tests are tagged with the format:
`// Feature: judys-hardware, Property {N}: {property_text}`

| Property | Test Description |
|---|---|
| Property 1 | Product add → getAll contains item with same fields |
| Property 2 | Product delete → getAll excludes item by id |
| Property 3 | Product edit → getAll returns updated fields |
| Property 4 | Category filter → all results match category |
| Property 5 | Price filter → all results within min/max range |
| Property 6 | Inquiry submit → getAll contains inquiry |
| Property 7 | Whitespace/empty fields → validateInquiry returns false |
| Property 8 | Settings save → getSettings returns same values |
| Property 9 | Available badge ↔ product.available |
| Property 10 | Category delete → no product retains deleted category id |
| Property 11 | Dashboard counts → match localStorage array lengths |
| Property 12 | Inquiry click → read field becomes true |
| Property 13 | Payment proof submit → jh_payments contains record with status "pending" |
| Property 14 | GCash submit without image → Payment.submit returns ok: false |
| Property 15 | Payment approve → payment status "approved", order status "paid" |
| Property 16 | Payment reject → payment status "rejected", order status "payment_rejected" |
| Property 17 | Delivery.getDeliveryInfo → fee is 0 for free barangays, 80 otherwise |

Each correctness property maps to exactly one property-based test.
