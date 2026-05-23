# Requirements Document

## Introduction

JUDY'S Mini Hardware is a frontend-only website for a local hardware store. The site serves two audiences: customers browsing and inquiring about products, and an admin managing products, categories, messages, and store settings. All data is stored in the browser via localStorage (no backend). The design follows a green color system (#004B23, #008000, #38B000) with mobile-first, modern UI.

## Glossary

- **System**: The JUDY'S Mini Hardware frontend web application
- **Customer**: A visitor browsing the public-facing pages
- **Admin**: The store owner/manager accessing the admin panel
- **Product**: A hardware item with name, price, category, image, description, and availability
- **Category**: A grouping label for products (e.g., Tools, Plumbing)
- **Inquiry**: A message submitted by a customer via the contact form
- **localStorage**: Browser-based storage used to persist all data without a backend
- **Available Today Badge**: A green visual indicator shown on in-stock products
- **Deep Forest**: Color #004B23 used for header, footer, and titles
- **Hardware Green**: Color #008000 used for buttons, icons, and highlights
- **Vibrant Growth**: Color #38B000 used for hover effects and accents
- **GCash**: A mobile wallet payment service used for digital payments
- **Payment Proof**: A screenshot of a completed GCash transaction uploaded by the customer
- **Payment Record**: A localStorage entry capturing payment method, amount, proof image, and review status
- **Order Status**: The current state of an order — one of: pending, payment_pending, paid, payment_rejected, confirmed, cancelled
- **Payment Status**: The admin review state of a payment — one of: pending, approved, rejected
- **Free Delivery Barangays**: Barangay Pangasihan and Barangay Talisay, which qualify for zero delivery fee

---

## Requirements

### Requirement 1

**User Story:** As a customer, I want to see a modern home page, so that I can learn about the store and quickly navigate to products.

#### Acceptance Criteria

1. THE System SHALL render a sticky navbar in Deep Forest (#004B23) containing the logo on the left, navigation links (Home, Products, About, Contact), and a "View Products" button in Hardware Green (#008000)
2. THE System SHALL display a hero section with the headline "Your Trusted Hardware Store", supporting subtext, a "Shop Now" CTA button in Hardware Green (#008000), and a hardware background image with a green overlay
3. WHEN a user hovers over the "Shop Now" button, THE System SHALL transition the button color to Vibrant Growth (#38B000) within 0.3 seconds
4. THE System SHALL display a featured categories section with cards for Tools, Construction Materials, Electrical Supplies, and Plumbing
5. WHEN a user hovers over a category card, THE System SHALL apply a border glow in Vibrant Growth (#38B000) within 0.3 seconds
6. THE System SHALL display a featured products grid showing product image, name, price, and a "View Details" button for each product
7. THE System SHALL display a store info section containing the business address, contact number, and an embedded map placeholder
8. THE System SHALL display a Call to Action banner with the text "Visit JUDY'S Mini Hardware Today!"
9. THE System SHALL render a footer in Deep Forest (#004B23) containing navigation links, contact info, and social media links

---

### Requirement 2

**User Story:** As a customer, I want to browse all products with filters, so that I can find items by category or price range.

#### Acceptance Criteria

1. THE System SHALL display a products page with a sidebar filter panel on the left and a product grid on the right
2. THE System SHALL populate the sidebar with category checkboxes derived from the current category list stored in localStorage
3. THE System SHALL include a price range slider or input in the sidebar filter
4. WHEN a customer applies a category filter, THE System SHALL display only products matching the selected categories
5. WHEN a customer applies a price range filter, THE System SHALL display only products whose price falls within the specified range
6. THE System SHALL render each product card with an image, name, price, and a "View Details" button
7. WHEN a customer hovers over a product card, THE System SHALL apply a card shadow and green border in Vibrant Growth (#38B000) within 0.3 seconds

---

### Requirement 3

**User Story:** As a customer, I want to view full product details, so that I can decide whether to inquire about purchasing.

#### Acceptance Criteria

1. THE System SHALL display a product details page with a large product image, product name, price, description, and availability status
2. WHEN a product is marked as available, THE System SHALL display an "Available Today" badge in Vibrant Growth (#38B000)
3. THE System SHALL display a "Contact to Order" button that navigates the customer to the contact page or opens a quick inquiry form
4. WHEN a customer clicks "Ask About This Product", THE System SHALL open a contact form or Messenger link pre-filled with the product name

---

### Requirement 4

**User Story:** As a customer, I want to read about the store, so that I can understand its background and values.

#### Acceptance Criteria

1. THE System SHALL display an About page containing the story of JUDY'S Mini Hardware, a mission and vision statement, and a store image

---

### Requirement 5

**User Story:** As a customer, I want to contact the store, so that I can ask questions or send inquiries.

#### Acceptance Criteria

1. THE System SHALL display a Contact page with a form containing fields for name, email, subject, and message
2. WHEN a customer submits the contact form with all required fields filled, THE System SHALL save the inquiry to localStorage and display a success confirmation message
3. IF a customer submits the contact form with any required field empty, THEN THE System SHALL display an inline validation error and prevent submission
4. THE System SHALL display the store phone number, business hours, and a Google Maps embed placeholder on the Contact page

---

### Requirement 6

**User Story:** As an admin, I want a dashboard overview, so that I can quickly see the state of the store.

#### Acceptance Criteria

1. THE System SHALL display an Admin Dashboard page with overview cards showing total product count, total category count, and total unread message count
2. THE System SHALL render each dashboard card with a white background and Hardware Green (#008000) icons
3. THE System SHALL provide navigation links from the dashboard to Product Management, Category Management, Customer Inquiries, and Website Settings

---

### Requirement 7

**User Story:** As an admin, I want to manage products, so that I can keep the product catalog up to date.

#### Acceptance Criteria

1. THE System SHALL display a product management page listing all products stored in localStorage
2. THE System SHALL provide an "Add Product" form with fields for product name, price, category, image upload, description, and availability toggle
3. WHEN an admin submits a valid Add Product form, THE System SHALL save the new product to localStorage and display it in the product list immediately
4. THE System SHALL provide an "Edit Product" action that pre-fills the form with the selected product's existing data
5. WHEN an admin submits a valid Edit Product form, THE System SHALL update the product in localStorage and reflect the change in the product list immediately
6. WHEN an admin clicks "Delete Product", THE System SHALL remove the product from localStorage and remove it from the product list immediately
7. THE System SHALL render Save/Update buttons in Hardware Green (#008000) and transition to Vibrant Growth (#38B000) on hover within 0.3 seconds

---

### Requirement 8

**User Story:** As an admin, I want to manage categories, so that I can organize the product catalog.

#### Acceptance Criteria

1. THE System SHALL display a category management page listing all categories stored in localStorage
2. THE System SHALL provide an "Add Category" form with a name field
3. WHEN an admin submits a valid Add Category form, THE System SHALL save the category to localStorage and display it in the category list immediately
4. THE System SHALL provide Edit and Delete actions for each category
5. WHEN an admin deletes a category, THE System SHALL remove the category from localStorage and update any products previously assigned to that category

---

### Requirement 9

**User Story:** As an admin, I want to view customer inquiries, so that I can respond to customer messages.

#### Acceptance Criteria

1. THE System SHALL display a Customer Inquiries page listing all messages saved in localStorage, showing sender name, email, subject, and message
2. THE System SHALL visually distinguish unread inquiries from read ones
3. WHEN an admin clicks on an inquiry, THE System SHALL mark it as read and display the full message details

---

### Requirement 10

**User Story:** As an admin, I want to edit website settings, so that I can keep store information current.

#### Acceptance Criteria

1. THE System SHALL display a Website Settings page with editable fields for business name, contact info, and address
2. WHEN an admin saves updated settings, THE System SHALL persist the changes to localStorage and reflect them across all public-facing pages immediately

---

### Requirement 11

**User Story:** As any user, I want a responsive mobile-first experience, so that I can use the site comfortably on a phone.

#### Acceptance Criteria

1. THE System SHALL render all pages with a mobile-first responsive layout that adapts correctly to screen widths from 320px to 1440px
2. THE System SHALL collapse the navbar into a hamburger menu on screen widths below 768px
3. WHEN a user taps the hamburger menu, THE System SHALL toggle the mobile navigation menu open and closed with a smooth transition

---

### Requirement 12

**User Story:** As any user, I want smooth visual animations, so that the site feels modern and polished.

#### Acceptance Criteria

1. THE System SHALL apply a 0.3-second CSS transition to all button hover color changes
2. THE System SHALL apply a 0.3-second CSS transition to all card hover effects (shadow, border glow)
3. THE System SHALL apply a glow effect in Vibrant Growth (#38B000) to buttons on hover

---

### Requirement 13

**User Story:** As a customer, I want to see available payment methods on the Product Details page and during checkout, so that I know how I can pay for my order.

#### Acceptance Criteria

1. THE System SHALL display a payment method selector on the Product Details page and in the order/checkout section with two options: "Cash (In-store)" and "GCash"
2. WHEN a customer selects "GCash", THE System SHALL display the GCash account name ("Judy Hardware"), the GCash number, and a scannable QR code image
3. WHEN a customer selects "Cash (In-store)", THE System SHALL display instructions for paying in person at the store
4. THE System SHALL render the payment method selector before the order confirmation step so the customer can choose before submitting

---

### Requirement 14

**User Story:** As a customer, I want to upload proof of my GCash payment, so that the store can verify and confirm my order.

#### Acceptance Criteria

1. THE System SHALL display a payment proof submission form containing fields for: customer name, product ordered, amount paid, and an image upload field for the GCash receipt screenshot
2. WHEN a customer submits the payment proof form with all required fields filled and an image attached, THE System SHALL save the payment record to localStorage with a status of "pending" and display the message "Payment submitted. Please wait for confirmation."
3. IF a customer submits the payment proof form without attaching an image, THEN THE System SHALL display a validation error and prevent submission
4. IF a customer submits the payment proof form with any required field empty, THEN THE System SHALL display an inline validation error and prevent submission
5. WHEN a payment proof is successfully submitted, THE System SHALL update the associated order status to "payment_pending"

---

### Requirement 15

**User Story:** As an admin, I want to review payment submissions, so that I can verify GCash payments and approve or reject them.

#### Acceptance Criteria

1. THE System SHALL display a Payment Verification page in the admin panel listing all submitted payments with: customer name, product ordered, amount paid, payment method, and submission date
2. WHEN an admin views a payment record, THE System SHALL display the uploaded receipt screenshot so the admin can verify the payment
3. THE System SHALL provide an "Approve" button and a "Reject" button for each pending payment record
4. WHEN an admin clicks "Approve", THE System SHALL update the payment status to "approved" and update the associated order status to "paid"
5. WHEN an admin clicks "Reject", THE System SHALL update the payment status to "rejected" and update the associated order status to "payment_rejected"
6. THE System SHALL display each payment record with a status indicator: "Pending", "Paid", or "Rejected"

---

### Requirement 16

**User Story:** As an admin, I want to manage delivery confirmation after payment, so that I can coordinate order fulfillment.

#### Acceptance Criteria

1. WHEN an admin approves a payment, THE System SHALL enable a "Confirm Delivery" action for that order
2. WHEN an admin confirms delivery, THE System SHALL update the order status to "confirmed"
3. THE System SHALL display the delivery fee on each order record: free for Barangay Pangasihan and Barangay Talisay, and the standard fee for all other areas
4. THE System SHALL display the order's barangay and delivery fee alongside the payment record so the admin can confirm delivery details before approving
