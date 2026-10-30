# NEST & NOVA — Full-Stack Electronics & Furniture E-Commerce Platform

> **Tagline:** *Technology Meets Timeless Living*

NEST & NOVA is a modern, responsive, production-style e-commerce platform that curates both high-performance **Electronics** (smartphones, studio headphones, laptops, displays) and artisanal **Furniture** (bouclé sofas, solid walnut standing desks, oak platform beds, travertine tables) under one unified brand.

Built with clean **Vanilla JavaScript, HTML5, CSS3** on the frontend, and a modular **Node.js, Express.js, MySQL** backend.

---

## 🌿 Key Features

### 🛍️ Client Shopping Experience
- **Icon-Driven Category Navigation:** Font Awesome 6 icons integrated into categories (Smartphones, Laptops, Headphones, TVs, Sofas, Beds, Chairs, Tables, Workspaces, Lighting).
- **Split-Layout Hero & Curated Collections:** Showcase lifestyle imagery blending computing hardware and organic furniture joinery.
- **Dynamic Catalog Engine:** Real-time filtering by category, brand, price range, and star rating, plus sorting (newest, price ascending/descending, rating, popularity).
- **Interactive Product Details:** Multi-image gallery with hover zoom, variant selectors (materials, sizes, storage, finishes), stock indicators, delivery postcode calculator, technical specs, ANSI dimensions, and customer reviews.
- **Full-Text Live Search:** Autocomplete suggestions while typing with direct product cards and matching categories.
- **Persistent Cart & Wishlist:** Works seamlessly for guests (via localStorage) and synchronizes with customer accounts.
- **Server-Side Price & Inventory Verification:** Subtotal, tiered shipping ($150 free shipping threshold), discounts, and 8.25% sales tax recalculated securely on the server.
- **Promotional Coupon System:** Automatic coupon validation for percentage or flat-rate codes (`WELCOME10`, `NOVA50`, `FREESHIP`).
- **Multi-Step Checkout & Mock Payments:** Multi-step wizard (Shipping, Delivery Speed, Payment, Order Summary) with test-card auto-fill and instant confirmation receipt.

### 🛡️ Security & Architecture
- **JWT Authentication via HTTP-Only Cookies:** Tokens are not stored in client-accessible `localStorage`.
- **Bcrypt Password Hashing:** Salted hashes for all customer and admin passwords.
- **Database Transactions:** ACID-compliant MySQL transactions guarantee inventory decrements and order snapshots occur atomically.
- **Helmet Security Headers:** Pre-configured Content Security Policy (CSP) permitting Google Fonts, Font Awesome CDN, and Unsplash imagery.
- **Input Validation & Rate Limiting:** Brute-force protection on authentication and sensitive endpoints.
- **Zero-Friction Relational Fallback:** If a local MySQL server is not running, the platform seamlessly activates an in-memory relational engine pre-seeded with 22 rich products, so you can test the application immediately without local database dependencies.

### ⚡ Admin Control Panel (`/admin`)
- **Protected by Role-Based Access Control (RBAC):** Accessible exclusively by authenticated admin accounts.
- **Overview Dashboard:** Total settled sales, order count, registered customer directory, and inventory metrics.
- **Low-Stock Inventory Alerts:** Warning alerts when any product stock drops to or below 5 units.
- **Product Management (CRUD):** Add, edit, delete, and search products with file uploads via Multer.
- **Order Fulfillment:** Live status updates (`processing`, `shipped`, `delivered`, `cancelled`) and carrier tracking number assignments.
- **Client Directory:** Customer purchase history and lifetime spend tracking.

---

## 🎨 Design System & Color Palette

| Element | Color Code | Purpose |
| :--- | :--- | :--- |
| **Primary Sage Green** | `#879780` | Buttons, navigation highlights, badges |
| **Dark Sage Green** | `#566B52` | Active states, hover fills, accents |
| **Light Sage Background** | `#E9EDE5` | Icon containers, tag backgrounds |
| **Walnut Brown** | `#5B3928` | Headings, brand logo, strong accents |
| **Dark Walnut** | `#38251C` | Announcement bar, footer, admin sidebar |
| **Warm Cream** | `#F7F4EC` | Hero background, product backgrounds |
| **Pure White** | `#FFFFFF` | Product cards, modal surfaces |
| **Main Text** | `#292A26` | Body typography and high-contrast labels |
| **Muted Text** | `#77776F` | Metadata, subtitles, SKU captions |
| **Border Color** | `#DADDD3` | Dividers, card borders, subtle outlines |

---

## 📁 Project Structure

```
nest-and-nova/
├── frontend/
│   ├── index.html              # Home page
│   ├── electronics.html        # Electronics catalog & filters
│   ├── furniture.html          # Furniture catalog & filters
│   ├── product.html            # Reusable product details page
│   ├── search.html             # Live search with autocomplete
│   ├── wishlist.html           # Wishlist page
│   ├── cart.html               # Shopping bag & coupon entry
│   ├── login.html              # User login
│   ├── register.html           # User registration
│   ├── checkout.html           # Multi-step checkout & payment
│   ├── account.html            # Customer profile & orders
│   ├── about.html              # Brand philosophy & story
│   ├── contact.html            # Concierge support & FAQ
│   ├── 404.html                # Custom 404 page
│   ├── robots.txt              # SEO crawler instructions
│   ├── sitemap.xml             # Search engine sitemap
│   ├── admin/
│   │   ├── index.html          # Admin dashboard & stats
│   │   ├── products.html       # Product CRUD & image upload
│   │   ├── orders.html         # Order status & tracking updates
│   │   └── customers.html      # Client directory & spend
│   ├── css/
│   │   ├── style.css           # Global design system & components
│   │   ├── responsive.css      # Breakpoints & mobile drawers
│   │   └── admin.css           # Admin control layout & tables
│   └── js/
│       ├── api.js              # Universal fetch client with cookies
│       ├── app.js              # State, toasts, header & mobile menu
│       ├── products.js         # Cards, catalog filters & details
│       ├── cart.js             # Cart management & calculations
│       ├── auth.js             # Authentication & user profile
│       ├── checkout.js         # Multi-step checkout & mock gateway
│       └── admin.js            # Admin guard, CRUD & stats
├── backend/
│   ├── server.js               # Express application entrypoint
│   ├── config/
│   │   └── db.js               # MySQL pool & resilient fallback engine
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   ├── admin.routes.js
│   │   └── contact.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   ├── admin.controller.js
│   │   └── contact.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification & admin guard
│   │   ├── upload.middleware.js # Multer file upload
│   │   └── error.middleware.js  # Centralized error handler
│   ├── services/
│   │   └── email.service.js    # Nodemailer order confirmations
│   └── scripts/
│       ├── setup-db.js         # MySQL schema runner
│       └── seed-db.js          # MySQL seed data runner
├── database/
│   ├── schema.sql              # Relational schema (19 tables)
│   └── seed.sql                # 22 rich sample products & seed data
├── uploads/                    # Product uploaded media
├── .env.example                # Template configuration
├── .env                        # Local configuration
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Review the included `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000

# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nest_and_nova

# JWT Authentication
JWT_SECRET=nest_and_nova_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
COOKIE_SECRET=nest_and_nova_cookie_secret_key_88291
```

### 3. Database Setup (Optional if MySQL is installed)
If you have MySQL running locally:
```bash
npm run db:setup
npm run db:seed
```
*Note: If MySQL is not currently running on your system, the server automatically starts in High-Performance Embedded Relational Mode with all 22 products and seed users fully functional.*

### 4. Start the Application
```bash
npm start
```
Or for live file-watching during development:
```bash
npm run dev
```

Visit the website at: **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nestandnova.com` | `admin123` | Full admin dashboard, product CRUD, orders, and stats |
| **Customer** | `customer@nestandnova.com` | `customer123` | Storefront, cart, reviews, address & order history |

---

## 🎟️ Promotional Coupons for Testing

- `WELCOME10` — **10% Off** your order.
- `NOVA50` — **$50 Flat Off** orders over $350.
- `FREESHIP` — **Free Expedited Shipping** on orders over $75.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new customer account.
- `POST /api/auth/login` — Sign in and receive an HTTP-only cookie.
- `POST /api/auth/logout` — Clear session cookies.
- `GET /api/auth/me` — Retrieve logged-in user profile & addresses.
- `PUT /api/auth/profile` — Update customer name and phone.
- `PUT /api/auth/change-password` — Change password.

### Catalog
- `GET /api/products` — Retrieve products with filters (`department`, `category`, `brand`, `min_price`, `max_price`, `sort`, `page`, `limit`).
- `GET /api/products/:id` — Retrieve product details, image gallery, variants, and verified customer reviews.
- `GET /api/products/search?q=query&suggest=true` — Autocomplete suggestions or full-text catalog search.
- `GET /api/categories` — List all categories with icons.
- `GET /api/categories/brands` — List featured brands.

### Cart & Orders
- `POST /api/cart/validate` — Recalculates subtotal, discounts, shipping, and tax on the server.
- `POST /api/cart/apply-coupon` — Validates coupon codes.
- `POST /api/orders` — Atomically creates an order, updates inventory, snapshots items, and dispatches confirmation.
- `GET /api/orders` — List past orders for authenticated user.
- `GET /api/orders/:id` — Get single order tracking and items.

### Reviews & Inquiry
- `POST /api/reviews` — Submit verified customer rating & review.
- `POST /api/inquiry/contact` — Concierge inquiry form submission.
- `POST /api/inquiry/newsletter` — Newsletter subscription.

### Admin Dashboard (Protected: `role: admin`)
- `GET /api/admin/dashboard` — Sales metrics, orders count, low-stock alerts.
- `GET /api/admin/products` — Full product list with inventory figures.
- `POST /api/admin/products` — Create new piece with Multer image upload.
- `PATCH /api/admin/products/:id` — Update product details.
- `DELETE /api/admin/products/:id` — Delete product.
- `GET /api/admin/orders` — View all customer orders.
- `PATCH /api/admin/orders/:id/status` — Update order status & tracking number.
- `GET /api/admin/customers` — List registered customers and lifetime spend.

---

## 🧪 Testing the Checkout Workflow

1. Navigate to `http://localhost:5000/electronics.html` or `furniture.html`.
2. Click **"Add to Bag"** on any piece, or click into a product details page to select variants.
3. Open the **Shopping Bag** (`/cart.html`). Enter coupon code `WELCOME10` and click **Apply**.
4. Click **"Proceed to Secure Checkout"**.
5. Step 1 (Shipping): Enter your address details.
6. Step 2 (Delivery): Select White-Glove delivery speed.
7. Step 3 (Payment): Click **"Auto-Fill Test Card"** to insert sandbox credentials (`4242 •••• •••• 4242`), then click **"Place Order & Pay"**.
8. View the instant confirmation screen, and click **"Print Receipt"**.
9. Sign in with `admin@nestandnova.com` (`admin123`) to see the order immediately appear in the **Admin Dashboard** (`/admin/orders.html`).

---

## 📄 License
MIT &copy; 2026 NEST & NOVA. All rights reserved.

