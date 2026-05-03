<div align="center">

<img 
  src="https://raw.githubusercontent.com/parthnarkar/FitMart/main/client/public/logo.png" 
  alt="FitMart" 
  width="100"
/>

# FitMart

### *Your All-in-One Fitness & Nutrition E-Commerce Platform*

> A full-stack MERN e-commerce application combining premium fitness gear, nutrition products, and seamless payments — built for learning, collaboration, and real-world use.

<br/>

[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2A5E?style=flat-square)](https://razorpay.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/parthnarkar/FitMart?style=for-the-badge&logo=github)](https://github.com/parthnarkar/FitMart/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/parthnarkar/FitMart?style=for-the-badge&logo=github)](https://github.com/parthnarkar/FitMart/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/parthnarkar/FitMart?style=for-the-badge&logo=github)](https://github.com/parthnarkar/FitMart/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/parthnarkar/FitMart?style=for-the-badge&logo=github)](https://github.com/parthnarkar/FitMart/pulls)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Seeding the Database](#-seeding-the-database)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Design System](#-design-system)
- [Admin Panel](#-admin-panel)
- [Notes & Recommendations](#-notes--recommendations)
- [Contributing](#-contributing)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🧠 About the Project

**FitMart** is a full-stack e-commerce web application built with the MERN stack. It's designed as both a **learning resource** and a **real-world starting point** for building modern storefronts.

The project covers end-to-end functionality including:

- 🔐 User authentication via Firebase (Email/Password + Google Sign-In)
- 🛒 Cart management with real-time stock reservation logic
- 💳 Secure payments via Razorpay (with HMAC signature verification)
- 📦 Order management with price snapshotting at purchase time
- 🤖 AI-powered Fitness Chatbot assistant
- 🧮 BMI & TDEE Calculator with personalized product recommendations
- 👑 Full Admin Panel with dashboard, inventory, reports, and customer management
- 🎯 Welcome discount system for first-time buyers

Whether you're a beginner learning full-stack development or an experienced developer looking to contribute — **FitMart is built for you.**

---

## 🌐 Live Demo

<p align="center">
  <a href="https://fitmart-omega.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Launch%20FitMart-Live%20Now-black?style=for-the-badge" alt="Launch FitMart Live Demo" />
  </a>
</p>

🔗 https://fitmart-omega.vercel.app/

> 💡 Try exploring products, cart, and the admin panel for full experience.

---

## ✨ Features

### Customer-Facing

| Feature | Description |
|---|---|
| 🛍️ Product Catalog | Browse products with images, pricing, badges & category filters |
| 🔍 Search | Real-time product search by name and brand |
| 🛒 Smart Cart | Cart with quantity controls and real-time stock reservation |
| 📦 Order Management | Orders with price snapshotting at time of purchase |
| 💳 Razorpay Payments | Secure order creation & HMAC payment verification |
| 🔐 Firebase Auth | Email/password and Google Sign-In |
| 🎁 Welcome Discount | 10% off automatically applied for first-time buyers |
| 🤖 Fitness Chatbot | AI-powered assistant for workout and nutrition queries |
| 🧮 BMI Calculator | Body metrics tool with TDEE calculation and product recommendations |
| 🏋️ Fitness Plans | Weight Loss, Muscle Building, and Mobility & Recovery plans |
| 📱 PWA Ready | Progressive Web App support for mobile installation |

### Admin-Facing

| Feature | Description |
|---|---|
| 📊 Dashboard | Revenue KPIs, charts, top products, and recent orders |
| 📦 Inventory | Real-time stock levels, low-stock alerts, and product filtering |
| 👥 Customers | Customer directory with segments (new / returning / high-value) |
| 🔍 Customer Detail | Full order history and spend analytics per customer |
| 📈 Reports | Sales reports with daily, weekly, and monthly breakdowns |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React v19** + **Vite** | UI framework with fast HMR dev experience |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **Firebase (client)** | Authentication |
| **Recharts** | Admin dashboard charts (AreaChart, BarChart) |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | REST API server |
| **Mongoose** | MongoDB ODM |
| **Firebase Admin SDK** | Server-side auth token verification |
| **Razorpay SDK** | Payment order creation and HMAC verification |

### Database & Services

| Service | Usage |
|---|---|
| **MongoDB** (Atlas or local) | Primary database |
| **Firebase** | Authentication provider |
| **Razorpay** | Payment processing |

---

## 📁 Project Structure

```
FitMart/
├── client/                        # React + Vite Frontend
│   ├── public/                    # Static assets (logo, icons)
│   ├── src/
│   │   ├── auth/
│   │   │   ├── firebase.js        # Firebase app initialization
│   │   │   ├── useAuth.js         # Auth state hook
│   │   │   └── useWelcomeDiscount.js  # First-order discount hook
│   │   ├── components/
│   │   │   ├── AdminNavbar.jsx    # Admin panel navigation bar
│   │   │   ├── AdminRoute.jsx     # Admin-only route guard
│   │   │   ├── BMICalculator.jsx  # BMI/TDEE calculator widget
│   │   │   ├── CartDrawer.jsx     # Slide-in cart panel
│   │   │   ├── FitnessChatBot.jsx # Floating AI chatbot
│   │   │   ├── Navbar.jsx         # Main navigation bar
│   │   │   ├── NonAdminRoute.jsx  # Redirects admin away from customer pages
│   │   │   └── WelcomeBanner.jsx  # First-visit discount banner
│   │   ├── pages/
│   │   │   ├── AdminCustomerDetail.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminInventory.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── Authentication.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MobilityRecoveryPlans.jsx
│   │   │   ├── MuscleBuildingPlans.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── ProductConfirmation.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   └── WeightLossPlans.jsx
│   │   ├── utils/
│   │   │   ├── formatters.js      # Currency formatter (INR)
│   │   │   ├── getAuthHeaders.js  # Firebase token → Authorization header
│   │   │   └── healthUtils.js     # BMI, BMR, TDEE calculations
│   │   ├── App.jsx                # Root router
│   │   ├── index.css              # Tailwind import
│   │   └── main.jsx               # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js + Express Backend
│   ├── models/
│   │   ├── Product.js             # Product schema
│   │   ├── Cart.js                # Cart schema
│   │   └── Order.js               # Order schema
│   ├── routes/
│   │   ├── products.js            # CRUD for products
│   │   ├── cart.js                # Cart management + stock reservation
│   │   ├── orders.js              # Order creation and retrieval
│   │   ├── payment.js             # Razorpay integration
│   │   ├── chat.js                # AI chatbot endpoint
│   │   ├── dashboard.js           # Admin dashboard data
│   │   ├── reports.js             # Sales reports
│   │   ├── customers.js           # Customer management
│   │   └── user.js                # Welcome discount & user management
│   ├── db.js                      # MongoDB connection
│   ├── index.js                   # Server entry point
│   └── seed.js                    # DB seed script
│
├── CONTRIBUTING.md
└── README.md
```

---

## 🗺️ Pages & Routes

### Public / Customer Routes

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing homepage with hero, categories, plans, testimonials |
| `/auth` | `Authentication` | Sign In, Sign Up, and Password Reset |
| `/home` | `HomePage` | Product catalog with search, cart, BMI calculator, plans |
| `/product/:productId` | `ProductPage` | Individual product detail page |
| `/checkout` | `Checkout` | Order review with discount summary |
| `/payment` | `PaymentPage` | Razorpay payment flow + demo bypass |
| `/payment-confirmation` | `ProductConfirmation` | Post-payment success screen |
| `/plans/weight-loss` | `WeightLossPlans` | Weight loss program listing |
| `/plans/muscle-building` | `MuscleBuildingPlans` | Muscle building program listing |
| `/plans/mobility-recovery` | `MobilityRecoveryPlans` | Mobility & recovery program listing |
| `*` | `NotFound` | 404 fallback |

### Admin Routes (guarded — admin UID only)

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | KPIs, revenue chart, top products, recent orders |
| `/admin/inventory` | `AdminInventory` | Stock levels with low-stock alerts |
| `/admin/customers` | `AdminCustomers` | All customers with segment tagging |
| `/admin/customers/:userId` | `AdminCustomerDetail` | Customer profile + full order history |
| `/admin/reports` | `AdminReports` | Sales reports (daily / weekly / monthly) |

> **Route Guards:** `AdminRoute` redirects non-admins to `/home`. `NonAdminRoute` redirects the admin account to `/admin/dashboard`.

---

## 🧩 Components

### `Navbar`
Dual-variant navigation bar (`landing` / `home`). Landing variant is transparent and becomes opaque on scroll. Home variant is sticky with search, cart icon (with badge), and user avatar dropdown.

### `CartDrawer`
Slide-in panel from the right showing cart items with quantity controls, remove buttons, subtotal, and a checkout CTA. Closes on `Escape` key or overlay click. Locks body scroll when open.

### `FitnessChatBot`
Floating chat widget (FAB in bottom-right corner) backed by the `/api/chat` endpoint. Supports markdown-style bold text rendering, typing indicator, and auto-scroll. Full-screen on mobile.

### `BMICalculator`
Form-based calculator that computes BMI and TDEE from user inputs (weight, height, age, gender, activity level). Displays results with a product category recommendation that links to the store.

### `WelcomeBanner`
Top-of-page animated banner shown to first-time users. Displays the 10% welcome discount and dismisses via a POST to `/api/user/dismiss-banner`.

### `AdminNavbar`
Admin-specific sticky navbar with range selector buttons (Today / Week / Month), brand link, and user avatar dropdown with sign out.

### `AdminRoute` / `NonAdminRoute`
React Router route guards using `useAuth` and `VITE_ADMIN_UID` to protect admin and customer routes respectively.

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [MongoDB](https://www.mongodb.com/atlas) connection (Atlas or local)
- A [Firebase](https://firebase.google.com/) project (for auth)
- A [Razorpay](https://razorpay.com/) account (for payments)

---

### 1. Clone the Repository

```bash
git clone https://github.com/parthnarkar/FitMart.git
cd FitMart
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```bash
cp .env.example .env   # if available, or create manually
```

Seed the database with sample products:

```bash
npm run seed
```

Start the backend dev server:

```bash
npm run dev
```

> The server runs at **http://localhost:5000** by default.

---

### 3. Set Up the Client

Open a **new terminal** and run:

```bash
cd client
npm install
npm run dev
```

> The client runs at **http://localhost:5173** by default.

---

## 🔑 Environment Variables

> ⚠️ **Never commit your `.env` files or API secrets to GitHub!** They are already in `.gitignore`.

### Server — `server/.env`

```env
MONGO_URI=<your_mongodb_connection_string>
MONGO_DB=<your_database_name>           # optional
PORT=5000
ALLOWED_ORIGIN=http://localhost:5173    # allowed frontend origin for CORS
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>

# Firebase Admin SDK (required for auth middleware)
FIREBASE_PROJECT_ID=<your_firebase_project_id>
FIREBASE_CLIENT_EMAIL=<your_firebase_client_email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Getting Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com) → **Project Settings** → **Service Accounts**
2. Select **Node.js** and click **"Generate new private key"**
3. A `.json` file downloads — copy these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (wrap in double quotes, keep all `\n`)
4. **Delete the `.json` file** — never commit it to GitHub

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=<your_razorpay_key_id>
VITE_ADMIN_UID=<firebase_uid_of_admin_account>

# Firebase config (from Firebase Console → Project Settings → General)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> **Setting the Admin UID:** Sign in to Firebase, find your user's UID in the Firebase Console under **Authentication → Users**, and paste it into `VITE_ADMIN_UID`. That account will be redirected to `/admin/dashboard` on login.

---

## 🌱 Seeding the Database

The seed script populates your MongoDB with sample fitness products across all categories (Equipment, Nutrition, Wearables):

```bash
cd server
npm run seed
```

Each seeded product includes: `productId`, `name`, `brand`, `category`, `price`, `originalPrice`, `rating`, `reviews`, `badge`, `image`, `stock`, and `reserved`.

---

## ▶️ Running the App

### Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

### Production

```bash
# Build the frontend
cd client && npm run build

# Start the server (serves API; deploy frontend dist/ separately)
cd server && npm start
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000` (or your `VITE_API_URL`)

### 🛍️ Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products (sorted by `productId`) |
| `GET` | `/api/products/:id` | Get product by `productId` |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update product by `productId` |
| `DELETE` | `/api/products/:id` | Delete product by `productId` |

### 🛒 Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart/:userId` | Get or create a user's cart |
| `POST` | `/api/cart/:userId/add` | Add item — body: `{ productId, quantity }` |
| `POST` | `/api/cart/:userId/remove` | Remove item — body: `{ productId, quantity }` |
| `DELETE` | `/api/cart/:userId` | Clear cart and release reserved stock |

### 📦 Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create order — body: `{ userId, items? }` |
| `GET` | `/api/orders/:userId` | List all orders for a user |

### 💳 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payment/create-order` | Create a Razorpay order |
| `POST` | `/api/payment/verify-payment` | Verify HMAC signature |
| `POST` | `/api/payment/clear-cart` | Release stock & clear cart — body: `{ userId }` |
| `POST` | `/api/payment/demo-success` | Simulate successful payment (testing only) |

> **Security:** Payment verification uses HMAC-SHA256 on `razorpay_order_id|razorpay_payment_id` with `RAZORPAY_KEY_SECRET`. Never expose this key to the client.

### 🤖 Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message — body: `{ message }` — returns `{ reply }` |

### 👤 User

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/login` | Register login + check welcome discount eligibility |
| `GET` | `/api/user/discount-status/:userId` | Get discount eligibility and percent |
| `POST` | `/api/user/use-discount` | Mark welcome discount as used |
| `POST` | `/api/user/dismiss-banner` | Dismiss the welcome banner |

### 📊 Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard?range=today\|week\|month` | Dashboard KPIs, charts, recent orders |
| `GET` | `/api/reports/sales?range=daily\|weekly\|monthly` | Sales summary + revenue by date + product performance |
| `GET` | `/api/customers` | All customers with order counts, spend, and segment |
| `GET` | `/api/customers/:userId` | Single customer profile + order history |

---

## 🗃️ Data Models

### Product

```js
{
  productId:     Number  (unique, required),
  name:          String,
  brand:         String,
  category:      String,   // "Equipment" | "Nutrition" | "Wearables"
  price:         Number  (required),
  originalPrice: Number,
  rating:        Number,   // 0–5
  reviews:       Number,
  badge:         String,   // e.g. "Best Seller", "New"
  image:         String,   // URL
  stock:         Number | null,  // null = unlimited
  reserved:      Number    // quantity currently in user carts
}
```

### Cart

```js
{
  userId: String  (indexed),
  items: [
    {
      productId: Number,
      quantity:  Number
    }
  ]
}
```

### Order

```js
{
  userId:    String,
  items: [
    {
      productId: Number,
      quantity:  Number,
      price:     Number   // snapshotted at purchase time
    }
  ],
  total:     Number,
  status:    String,      // "created" | "paid" | "failed"
  createdAt: Date
}
```

---

## 🎨 Design System

FitMart uses a **luxury refined minimalism** design language — clean, editorial, and spacious. Full details are in [`client/DesignSystem.md`](client/DesignSystem.md).

### Color Palette (`stone-*` only)

| Role | Tailwind Class | Usage |
|---|---|---|
| Primary / Dark BG | `stone-900` | Buttons, navbars, dark sections |
| Borders | `stone-200` | Card borders, dividers |
| Subtle BG | `stone-100` | Page backgrounds, hover states |
| Main BG | `stone-50` | Default page background |
| Cards | `white` | Cards, inputs, modals |

> ⚠️ **No other color families** (no blue, green, purple). All accent colors use `stone-*`.

### Typography

- **Headings:** `DM Serif Display`
- **Body / UI:** `DM Sans`

### Key Component Patterns

- **Buttons:** Always `rounded-full` (pill shape)
- **Cards:** Always `rounded-2xl`
- **Inputs:** `rounded-lg` with `focus:border-stone-900`
- **Section headings:** Always preceded by a `text-xs tracking-[0.2em] uppercase text-stone-400` eyebrow label

---

## 👑 Admin Panel

The admin panel is accessible only to the account whose Firebase UID matches `VITE_ADMIN_UID`.

### Accessing Admin

1. Set `VITE_ADMIN_UID` in `client/.env` to your Firebase user UID
2. Sign in with that account — you'll be automatically redirected to `/admin/dashboard`

### Admin Features

**Dashboard (`/admin/dashboard`)**
- KPI cards: Total Revenue, Total Orders, Customers, Low Stock count
- Revenue over time (Area chart)
- Top 5 selling products (horizontal Bar chart)
- Recent orders table with customer info and status badges
- Time range filter: Today / Week / Month
- Quick navigation cards to Inventory, Customers, Reports

**Inventory (`/admin/inventory`)**
- Real-time stock levels for all products
- Status badges: In Stock / Low Stock / Unlimited
- Filter pills by stock status
- Stock, Reserved, and Available columns

**Customers (`/admin/customers`)**
- All customers sorted by spend
- Segment badges: `new` / `returning` / `high-value`
- Click through to individual customer profiles

**Customer Detail (`/admin/customers/:userId`)**
- Customer avatar, name, email, Firebase UID
- KPI cards: Order Count, Total Spend, First Order, Last Order
- Expandable order history with line-item breakdown

**Reports (`/admin/reports`)**
- Summary KPIs: Total Revenue, Total Orders, Avg Order Value
- Revenue by date table
- Product performance ranking
- Time range: Daily / Weekly / Monthly

---

## 📝 Notes & Recommendations

- **API URL consistency** — Some client files still use the hardcoded `http://localhost:5000`. Standardize everything on `VITE_API_URL`. This is a great first contribution!
- **Cart reservation** — `Product.reserved` increments on cart add and decrements on cart remove/clear. Orders finalize the reservation but don't re-release it — this is intentional.
- **Razorpay** — Always verify payments server-side with HMAC. Never expose `RAZORPAY_KEY_SECRET` to the client.
- **Firebase** — Only client-facing Firebase config keys go in the Vite `.env`. Never put service account credentials in the client `.env`.
- **Demo payment** — A "Simulate Success" bypass button is available on the payment page for testing without a real Razorpay transaction. Remove or guard this in production.
- **Admin UID** — The admin guard is purely UID-based. For production, consider role-based access control stored in your database.

---

## 🤝 Contributing

We love contributions! FitMart is an open-source, community-driven project and contributions of all kinds are welcome — from fixing typos to building new features.

Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for a full guide on:
- Setting up your development environment
- Picking and working on issues
- Submitting a Pull Request
- Code style and commit conventions

**New to open source?** Look for issues labelled [`good first issue`](https://github.com/parthnarkar/FitMart/labels/good%20first%20issue) — they're perfect starting points! 🌱

---

## 👥 Contributors

Thanks to everyone who has contributed to FitMart.

<a href="https://github.com/parthnarkar/FitMart/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=parthnarkar/FitMart" alt="FitMart contributors" />
</a>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Parth Narkar](https://github.com/parthnarkar) and the [Parth Builds Community](https://www.instagram.com/parth.builds/)

⭐ **Star this repo** if you find it useful — it helps a lot!

</div>