# Requirements Document

## Introduction

This document defines the formal requirements for migrating JUDY'S Mini Hardware from a multi-page HTML/CSS/JS application to a React + Vite + Tailwind CSS single-page application. The migration preserves all existing functionality, visual design, layout, spacing, responsiveness, and user behavior. Only the technology stack changes — HTML becomes JSX, CSS files are replaced with Tailwind utility classes, and vanilla JS logic is encapsulated in controller modules consumed by React components.

The application serves two distinct user roles: **User** (storefront) and **Admin** (management panel), both served from a single Vite/React entry point via React Router v6 with route-level authentication guards.

---

## Glossary

- **App**: The React + Vite single-page application being produced by this migration
- **Router**: The React Router v6 instance defined in `src/App.jsx`
- **AuthGuard**: A React component that protects user-facing routes requiring authentication
- **AdminAuthGuard**: A React component that protects all admin routes
- **UserController**: The module at `src/controllers/userController.js` exposing auth, order, payment, delivery, and store logic
- **AdminController**: The module at `src/controllers/adminController.js` exposing admin auth, product, category, order, payment, inquiry, and settings logic
- **Store**: The existing `js/store.js` localStorage abstraction module
- **Navbar**: The `src/components/Navbar.jsx` sticky top navigation component for user-facing pages
- **Footer**: The `src/components/Footer.jsx` shared footer component for user-facing pages
- **Sidebar**: The `src/components/Sidebar.jsx` admin panel navigation component
- **AdminLayout**: The `src/components/AdminLayout.jsx` wrapper layout for all admin pages
- **Modal**: The `src/components/Modal.jsx` reusable overlay component
- **ProductCard**: The `src/components/ProductCard.jsx` reusable product display component
- **BuyNowModal**: The `src/components/BuyNowModal.jsx` full order placement modal
- **Product**: A data object conforming to the Product interface defined in the design document
- **Order**: A data object conforming to the Order interface defined in the design document
- **Payment**: A data object conforming to the Payment interface defined in the design document
- **Inquiry**: A data object conforming to the Inquiry interface defined in the design document
- **Settings**: A data object conforming to the Settings interface defined in the design document
- **UserSession**: A data object representing the currently authenticated user
- **filterByCategory**: A pure function exported from UserController that filters products by category
- **filterByPrice**: A pure function exported from UserController that filters products by price range

---

## Requirements

### Requirement 1: Application Entry Point and Routing

**User Story:** As a developer, I want a single Vite/React entry point with React Router v6 routing, so that all pages are served from one SPA without full-page reloads.

#### Acceptance Criteria

1. THE App SHALL render via `ReactDOM.createRoot` in `src/main.jsx` mounting to the `#root` element in `index.html`
2. THE Router SHALL define a route for each of the following user-facing paths: `/`, `/products`, `/products/:id`, `/login`, `/register`, `/contact`, `/about`, and `/account`
3. THE Router SHALL define a route for each of the following admin paths: `/admin/login`, `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/payments`, `/admin/inquiries`, and `/admin/settings`
4. WHEN a user navigates between routes, THE App SHALL update the displayed page without a full browser reload
5. WHEN a route path does not match any defined route, THE Router SHALL redirect the user to `/`

---

### Requirement 2: Authentication Guards

**User Story:** As a system, I want route-level authentication guards, so that protected pages are inaccessible to unauthenticated users.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access `/account`, THE AuthGuard SHALL redirect the user to `/login`
2. WHEN an unauthenticated user attempts to access `/account`, THE AuthGuard SHALL append a `?next=/account` query parameter to the redirect URL
3. WHEN an unauthenticated admin attempts to access any route under `/admin` (excluding `/admin/login`), THE AdminAuthGuard SHALL redirect the admin to `/admin/login`
4. WHEN an authenticated user accesses a route wrapped by AuthGuard, THE AuthGuard SHALL render the protected page without redirection
5. WHEN an authenticated admin accesses a route wrapped by AdminAuthGuard, THE AdminAuthGuard SHALL render the protected admin page without redirection

---

### Requirement 3: User Authentication

**User Story:** As a user, I want to register, log in, and log out of my account, so that I can access order history and manage my profile.

#### Acceptance Criteria

1. WHEN a user submits valid registration data (name, email, password), THE UserController SHALL create a new user record and return `{ ok: true, user }`
2. WHEN a user submits registration data with an email already in use, THE UserController SHALL return `{ ok: false, error }` without creating a duplicate user
3. WHEN a user submits valid login credentials matching a registered user, THE UserController SHALL authenticate the session and return `{ ok: true, user }`
4. WHEN a user submits login credentials that do not match any registered user, THE UserController SHALL return `{ ok: false, error }` without creating a session
5. WHEN a logged-in user calls logout, THE UserController SHALL clear the session so that `authController.isLoggedIn()` returns `false`
6. WHEN no user is logged in, THE UserController SHALL return `null` from `authController.currentUser()`
7. WHEN a logged-in user submits valid profile update data, THE UserController SHALL update the user record and return `{ ok: true, user }`

---

### Requirement 4: Product Filtering

**User Story:** As a user, I want to filter products by category and price range on the Products page, so that I can quickly find items that match my needs.

#### Acceptance Criteria

1. WHEN `filterByCategory` is called with an empty category list, THE UserController SHALL return all products unchanged
2. WHEN `filterByCategory` is called with a non-empty category list, THE UserController SHALL return only products whose category matches one of the selected categories
3. WHEN `filterByCategory` is applied twice with the same category list, THE UserController SHALL return the same result as applying it once (idempotent)
4. WHEN `filterByPrice` is called with a minimum and maximum price, THE UserController SHALL return only products whose price is greater than or equal to the minimum and less than or equal to the maximum
5. WHEN `filterByPrice` is called with no bounds specified, THE UserController SHALL return all products unchanged
6. WHEN a user selects a category filter via `?category=` query parameter on the Products page, THE Products page SHALL pre-select that category in the filter sidebar

---

### Requirement 5: Order Placement

**User Story:** As a logged-in user, I want to place an order for a product, so that I can purchase hardware items for delivery.

#### Acceptance Criteria

1. WHEN a logged-in user submits a valid order via BuyNowModal, THE UserController SHALL create an order record containing all required fields (userId, productId, quantity, barangay, deliveryFee, totalPrice, status, createdAt) and return `{ ok: true, order }`
2. WHEN `orderController.getByUser` is called with a userId, THE UserController SHALL return only orders whose `userId` matches the provided value
3. WHEN a user cancels a pending order, THE UserController SHALL update the order status to `'cancelled'` and return `{ ok: true }`
4. WHEN an unauthenticated user clicks "Buy Now", THE BuyNowModal SHALL not open and THE App SHALL redirect the user to `/login`
5. WHEN a user selects a barangay in BuyNowModal, THE BuyNowModal SHALL display the delivery fee or free delivery label before order submission

---

### Requirement 6: Delivery Information

**User Story:** As a user, I want to see accurate delivery fees based on my barangay, so that I know the total cost before placing an order.

#### Acceptance Criteria

1. WHEN `deliveryController.getDeliveryInfo` is called with a barangay that is in the free delivery list, THE UserController SHALL return `{ free: true, fee: 0 }`
2. WHEN `deliveryController.getDeliveryInfo` is called with a barangay that is not in the free delivery list, THE UserController SHALL return `{ free: false, fee }` where `fee` is a positive number
3. THE UserController SHALL expose `deliveryController.getFreeBarangays()` returning the complete list of barangays eligible for free delivery

---

### Requirement 7: Payment Submission

**User Story:** As a user, I want to submit payment for my order (cash or GCash), so that the admin can process and confirm my purchase.

#### Acceptance Criteria

1. WHEN a user submits valid payment data for an order, THE UserController SHALL create a payment record and return `{ ok: true, payment }`
2. WHEN `paymentController.getByOrder` is called with an orderId after a payment has been submitted for that order, THE UserController SHALL return the corresponding payment record
3. WHEN a user selects GCash as the payment method, THE BuyNowModal SHALL display the GCash account name, number, and QR code before allowing proof upload
4. WHEN a user selects GCash but has not uploaded a proof image, THE BuyNowModal SHALL prevent form submission and display an inline error message
5. WHEN `paymentController.getByUser` is called with a userId, THE UserController SHALL return only payments whose `userId` matches the provided value

---

### Requirement 8: Admin Product Management

**User Story:** As an admin, I want to create, update, and delete products, so that I can keep the store catalog current.

#### Acceptance Criteria

1. WHEN an admin saves a new product (no existing id), THE AdminController SHALL create the product and make it retrievable via `productController.getAll()`
2. WHEN an admin saves an existing product (with an existing id), THE AdminController SHALL update the product fields and preserve the product's id
3. WHEN an admin deletes a product by id, THE AdminController SHALL remove the product so it no longer appears in `productController.getAll()`
4. WHEN an admin uploads a product image, THE AdminProducts page SHALL read the file using the FileReader API and store it as a base64 string on the product record

---

### Requirement 9: Admin Category Management

**User Story:** As an admin, I want to manage product categories, so that products are organized for easy browsing.

#### Acceptance Criteria

1. WHEN an admin saves a new category, THE AdminController SHALL create the category and make it retrievable via `categoryController.getAll()`
2. WHEN an admin saves an existing category, THE AdminController SHALL update the category fields
3. WHEN an admin deletes a category by id, THE AdminController SHALL remove the category from `categoryController.getAll()`
4. WHEN an admin deletes a category, THE AdminController SHALL clear the `category` field on all products that referenced the deleted category

---

### Requirement 10: Admin Order Management

**User Story:** As an admin, I want to view and update the status of all orders, so that I can manage fulfillment and communicate with customers.

#### Acceptance Criteria

1. THE AdminController SHALL expose `adminOrderController.getAll()` returning all orders across all users
2. WHEN an admin calls `adminOrderController.updateStatus(id, status)` with a valid order id and status, THE AdminController SHALL update the order's status field to the new value
3. WHEN the AdminOrders page loads, THE AdminOrders page SHALL display all orders with filtering controls for status

---

### Requirement 11: Admin Payment Review

**User Story:** As an admin, I want to approve or reject GCash payment submissions, so that I can confirm payments before processing orders.

#### Acceptance Criteria

1. THE AdminController SHALL expose `adminPaymentController.getAll()` returning all payment records
2. WHEN an admin calls `adminPaymentController.review(paymentId, 'approved')`, THE AdminController SHALL update the payment status to `'approved'` and set `reviewedAt` to the current timestamp
3. WHEN an admin calls `adminPaymentController.review(paymentId, 'rejected')`, THE AdminController SHALL update the payment status to `'rejected'` and set `reviewedAt` to the current timestamp
4. WHEN an admin clicks a GCash proof image thumbnail, THE AdminPayments page SHALL open a lightbox displaying the full-size proof image

---

### Requirement 12: Admin Inquiry Management

**User Story:** As an admin, I want to read and manage customer inquiries, so that I can respond to customer questions and feedback.

#### Acceptance Criteria

1. THE AdminController SHALL expose `inquiryController.getAll()` returning all inquiry records
2. WHEN an admin calls `inquiryController.markRead(id)`, THE AdminController SHALL set the inquiry's `read` field to `true`
3. WHEN an admin calls `inquiryController.markUnread(id)` after `markRead(id)`, THE AdminController SHALL set the inquiry's `read` field to `false`
4. WHEN an admin calls `inquiryController.delete(id)`, THE AdminController SHALL remove the inquiry from `inquiryController.getAll()`
5. WHEN an admin selects an inquiry from the list, THE AdminInquiries page SHALL display the full inquiry detail in a side panel

---

### Requirement 13: Admin Settings Management

**User Story:** As an admin, I want to update store settings (business info, delivery config, GCash config, credentials), so that the storefront reflects current business information.

#### Acceptance Criteria

1. WHEN an admin saves a partial settings object, THE AdminController SHALL merge the new values with existing settings without overwriting unmodified fields
2. WHEN `settingsController.get()` is called after a save, THE AdminController SHALL return the most recently saved settings
3. WHEN an admin saves GCash configuration, THE AdminController SHALL persist the GCash name, number, and QR image so that `paymentController.getGcashConfig()` returns the updated values

---

### Requirement 14: Admin Dashboard Metrics

**User Story:** As an admin, I want to see a summary of key business metrics on the dashboard, so that I can monitor store activity at a glance.

#### Acceptance Criteria

1. WHEN `dashboardController.getMetrics()` is called, THE AdminController SHALL return a metrics object containing: `products` (total product count), `categories` (total category count), `availableStock` (count of products with `available: true`), `totalOrders`, `pendingOrders` (count of orders with status `'pending'`), `unreadMsgs` (count of inquiries with `read: false`), and `totalSales`
2. WHEN the product count changes due to a create or delete operation, THE AdminController SHALL reflect the updated count in the next call to `dashboardController.getMetrics()`
3. WHEN the pending order count changes due to a status update, THE AdminController SHALL reflect the updated count in the next call to `dashboardController.getMetrics()`

---

### Requirement 15: Navbar Component

**User Story:** As a user, I want a consistent sticky navigation bar on all storefront pages, so that I can navigate the site easily from any page.

#### Acceptance Criteria

1. THE Navbar SHALL render with a sticky top position and `bg-[#004B23]` background on all user-facing pages
2. WHEN a user is not logged in, THE Navbar SHALL display a "Sign In" button linking to `/login`
3. WHEN a user is logged in, THE Navbar SHALL display the user's first name and a link to `/account`
4. WHEN the viewport is below the `md` breakpoint, THE Navbar SHALL show a hamburger menu button and hide the full navigation links
5. WHEN a user clicks the hamburger menu button, THE Navbar SHALL toggle the mobile navigation menu open or closed
6. WHEN the current route matches a navigation link's path, THE Navbar SHALL apply an active highlight style to that link

---

### Requirement 16: Footer Component

**User Story:** As a user, I want a consistent footer on all storefront pages, so that I can find contact information and quick links.

#### Acceptance Criteria

1. THE Footer SHALL render a three-column grid layout on `lg:` viewports and a stacked layout on smaller viewports
2. THE Footer SHALL load and display contact information from `storeController.getSettings()` via UserController
3. THE Footer SHALL include a brand column, a quick links column, and a contact information column

---

### Requirement 17: Modal Component

**User Story:** As a user, I want modal dialogs for forms and confirmations, so that I can complete actions without leaving the current page.

#### Acceptance Criteria

1. WHEN the `open` prop is `true`, THE Modal SHALL render a fixed overlay with a backdrop
2. WHEN a user clicks the backdrop, THE Modal SHALL call the `onClose` callback
3. WHEN a user presses the Escape key while a Modal is open, THE Modal SHALL call the `onClose` callback
4. WHEN the viewport is below the `sm` breakpoint, THE Modal SHALL slide up from the bottom of the screen
5. WHEN the viewport is at or above the `sm` breakpoint, THE Modal SHALL render centered on the screen

---

### Requirement 18: ProductCard Component

**User Story:** As a user, I want product cards that display key product information, so that I can browse and select products efficiently.

#### Acceptance Criteria

1. WHEN rendered with a product object, THE ProductCard SHALL display the product's image, name, price, and availability status
2. WHEN a user clicks the "Details" link on a ProductCard, THE App SHALL navigate to `/products/:id` for that product
3. WHEN a user clicks the "Buy Now" button on a ProductCard, THE ProductCard SHALL call the `onBuyNow` callback with the product object

---

### Requirement 19: Admin Layout and Sidebar

**User Story:** As an admin, I want a consistent admin panel layout with navigation, so that I can move between admin sections efficiently.

#### Acceptance Criteria

1. THE AdminLayout SHALL render a grid layout with a sidebar column (200px on `md:`, 240px on `lg:`) and a main content column
2. WHEN the viewport is below the `md` breakpoint, THE Sidebar SHALL be hidden and replaced by a hamburger drawer
3. WHEN an admin clicks the hamburger button on mobile, THE AdminLayout SHALL open the sidebar as a slide-in drawer overlay
4. WHEN an admin clicks the logout link in the Sidebar, THE Sidebar SHALL call `adminController.logout()` and navigate to `/admin/login`
5. WHEN rendered with an `activePage` prop, THE Sidebar SHALL apply an active highlight style to the matching navigation link

---

### Requirement 20: Tailwind CSS Migration

**User Story:** As a developer, I want all styling to use Tailwind CSS utility classes with no separate CSS files, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. THE App SHALL contain no CSS files other than `src/index.css` (which contains only Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`)
2. THE `tailwind.config.js` SHALL define custom color tokens mapping the original CSS variables: `forest` (`#004B23`), `green` (`#008000`), `growth` (`#38B000`), `dark` (`#1a1a1a`), `muted` (`#555555`), and `light` (`#F5F5F5`)
3. THE App SHALL preserve the original visual design, layout, spacing, and responsiveness of all pages using Tailwind utility classes

---

### Requirement 21: State Management

**User Story:** As a developer, I want each page to manage its own local state without an external state library, so that the architecture remains simple and maintainable.

#### Acceptance Criteria

1. THE App SHALL use `useState` and `useEffect` hooks for all component-level state management without requiring Redux, Zustand, or any other external state library
2. WHEN a page component mounts, THE App SHALL load its required data from the appropriate controller via `useEffect`
3. WHEN route parameters change (e.g., product id), THE App SHALL reload the relevant data via `useEffect` with the parameter as a dependency
4. THE App SHALL use `useParams` to read URL path parameters and `useSearchParams` to read query string parameters

---

### Requirement 22: Error Handling

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a product id in the URL does not match any product in the store, THE ProductDetail page SHALL redirect the user to `/products`
2. WHEN a form submission fails validation, THE App SHALL display inline error messages adjacent to the invalid fields without navigating away
3. IF the Store module encounters a localStorage read or write error, THEN THE App SHALL display an empty state rather than crashing
4. WHEN a GCash payment form is submitted without a proof image, THE BuyNowModal SHALL display an inline error and prevent submission

---

### Requirement 23: Dependencies and Build Configuration

**User Story:** As a developer, I want the project to use only the required dependencies with a working Vite build configuration, so that the app builds and runs correctly.

#### Acceptance Criteria

1. THE App SHALL declare `react-router-dom` as a dependency in `package.json`
2. THE App SHALL use Font Awesome 6 icons via CDN link in `index.html` (no npm package required)
3. WHEN `vite build` is executed, THE App SHALL produce a production bundle without errors
4. THE `src/index.css` SHALL contain only the three Tailwind directives and no custom CSS rules
