<div align="center">

<img src="https://raw.githubusercontent.com/parthbuilds-community/FitMart/main/client/public/logo.png" alt="FitMart Logo" width="90" />

# FitMart

### *Your All-in-One Fitness & Nutrition E-Commerce Platform*

> A production-grade, open-source MERN e-commerce app built for the community — featuring AI-powered fitness tools, real payments, and a full admin panel. **Built to be contributed to.**

<br/>

[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2A5E?style=flat-square)](https://razorpay.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](docs/CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square)]()

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/parthbuilds-community/FitMart?style=for-the-badge&logo=github&color=black)](https://github.com/parthbuilds-community/FitMart/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/parthbuilds-community/FitMart?style=for-the-badge&logo=github&color=black)](https://github.com/parthbuilds-community/FitMart/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/parthbuilds-community/FitMart?style=for-the-badge&logo=github&color=black)](https://github.com/parthbuilds-community/FitMart/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/parthbuilds-community/FitMart?style=for-the-badge&logo=github&color=black)](https://github.com/parthbuilds-community/FitMart/pulls)

<br/>

**[🚀 Live Demo](https://fitmart-omega.vercel.app/)** · **[🐛 Report a Bug](https://github.com/parthbuilds-community/FitMart/issues/new?template=bug_report.md)** · **[✨ Request a Feature](https://github.com/parthbuilds-community/FitMart/issues/new?template=feature_request.md)** · **[📖 Contributing Guide](docs/CONTRIBUTING.md)**

</div>

---

## 🙋 New Here? Start Contributing in 3 Steps

> No experience with open source? No problem. FitMart is beginner-friendly by design.

```
1. Fork the repo         →   Click "Fork" at the top right of this page
2. Pick an issue         →   Look for labels: good first issue · help wanted · bug
3. Open a PR             →   We review within 48 hours and give feedback
```

**[→ Browse issues ready to work on](https://github.com/parthbuilds-community/FitMart/issues?q=is%3Aopen+label%3A%22good+first+issue%22)**

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Docker Setup](#-running-with-docker)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Admin Panel](#-admin-panel)
- [Contributing](#-contributing)
- [Good First Issues](#-good-first-issues)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🧠 About the Project

**FitMart** is a full-stack, open-source e-commerce platform for fitness gear and nutrition products — built with the MERN stack. Every layer of the system is real: real payments, real authentication, real AI, real email delivery.

What makes FitMart different from tutorial projects:

- **Production patterns** — HMAC payment verification, atomic stock reservations, Firebase Admin SDK on the server, rate limiting, Helmet security headers
- **AI integration** — Google Gemini 2.5 Flash powers the fitness chatbot with graceful static fallback
- **Real DevOps hooks** — Docker Compose, Vercel config, seed scripts, and environment validation on startup
- **Open by design** — Every component, route, service, and model is documented and contribution-ready

Whether you're picking up your first open-source issue or shipping a new feature — this codebase is structured for you.

---

## 🌐 Live Demo

<p align="center">
  <a href="https://fitmart-omega.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/▶%20Launch%20FitMart-Live%20Now-black?style=for-the-badge" alt="Launch FitMart" />
  </a>
</p>

🔗 **https://fitmart-omega.vercel.app/**

> Try the product catalog, AI chatbot, workout tracker, and admin panel (credentials in [CONTRIBUTING.md](docs/CONTRIBUTING.md)).

---

## ✨ Features

### 🛍️ Customer-Facing

| Feature | Description |
|---|---|
| Product Catalog | Browse with images, pricing, badges & category filters |
| Real-time Search | Search by name and brand, instant results |
| Smart Cart | Quantity controls with atomic stock reservation |
| Order Management | Price snapshotting at purchase time |
| Razorpay Payments | Secure HMAC-verified payment flow |
| Firebase Auth | Email/password + Google Sign-In |
| Welcome Discount | 10% off auto-applied for first-time buyers |
| AI Fitness Chatbot | Gemini 2.5 Flash — workout & nutrition queries |
| BMI + TDEE Calculator | Body metrics with product recommendations |
| Calorie Calculator | Daily targets for weight loss and muscle gain |
| Workout Tracker | FullCalendar-based fitness planning calendar |
| Workout Notes | Log exercises with animated GIFs (ExerciseDB) |
| Nearby Gyms | Fitness center discovery from saved address |
| User Profile | Manage info, shipping addresses, default address |
| Fitness Plans | Weight Loss, Muscle Building, Mobility & Recovery |
| Bug Reporter | In-app widget, auto-attaches URL + user info |
| Welcome Email | Automated first-purchase congratulations |
| PWA Ready | Mobile installation support |

### 👑 Admin-Facing

| Feature | Description |
|---|---|
| Dashboard | Revenue KPIs, charts, top products, recent orders |
| Inventory | Real-time stock with low-stock alerts |
| Customers | Directory with new / returning / high-value segments |
| Customer Detail | Full order history + spend analytics |
| Reports | Sales breakdowns: daily / weekly / monthly |
| Marketing | Curated digital strategy cards for FitMart |
| Bug Tracker | Manage user-submitted bugs with status transitions |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React v19 + Vite | UI framework with fast HMR |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Firebase (client) | Authentication |
| Recharts | Admin dashboard charts |
| Framer Motion | Animations & transitions |
| FullCalendar | Interactive workout calendar |
| TanStack Query | Infinite scroll + client caching |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Mongoose | MongoDB ODM |
| Firebase Admin SDK | Server-side token verification |
| Razorpay SDK | Payment creation + HMAC verification |
| Nodemailer | Transactional email via SMTP |
| Helmet | HTTP security headers |
| express-rate-limit | API + payment endpoint rate limiting |
| Google Gemini 2.5 Flash | AI chatbot |

### Infrastructure & Services
| Service | Role |
|---|---|
| MongoDB Atlas | Primary database |
| Firebase Auth | Authentication provider |
| Razorpay | Payment processing |
| ExerciseDB (RapidAPI) | Exercise library + animated GIFs |
| Redis (optional) | Product list caching |
| Docker + Compose | Full-stack local development |
| Vercel | Frontend deployment |

---

## 📁 Project Structure

```
FitMart/
├── client/                        # React + Vite Frontend
│   └── src/
│       ├── auth/                  # Firebase init, useAuth hook, discount hook
│       ├── components/            # Reusable UI components
│       │   ├── FitnessChatBot.jsx # Gemini-powered floating chatbot
│       │   ├── CartDrawer.jsx     # Slide-in cart panel
│       │   ├── WorkoutCalendar.jsx
│       │   ├── BMICalculator.jsx
│       │   ├── NearbyFitnessCenters.jsx
│       │   └── ReportBugButton.jsx
│       ├── pages/                 # Route-level page components
│       │   ├── AdminDashboard.jsx
│       │   ├── HomePage.jsx
│       │   ├── TrackerPage.jsx
│       │   ├── NotesPage.jsx
│       │   └── ...
│       ├── hooks/
│       │   └── useInfiniteProducts.js  # TanStack infinite scroll
│       └── utils/
│           ├── healthUtils.js     # BMI, BMR, TDEE calculations
│           ├── formatters.js      # INR currency formatter
│           └── normalizeProduct.js
│
├── server/                        # Node.js + Express Backend
│   ├── middleware/
│   │   ├── verifyFirebaseToken.js # Bearer token auth
│   │   ├── verifyAdmin.js         # Admin UID guard
│   │   └── logger.js
│   ├── models/                    # Mongoose schemas
│   │   ├── Product.js · Cart.js · Order.js
│   │   ├── UserProfile.js · Bug.js · FitnessCenter.js
│   ├── routes/                    # Express route handlers
│   │   ├── products.js · cart.js · orders.js
│   │   ├── payment.js · chat.js · user.js
│   │   ├── exercises.js · fitnessCenters.js
│   │   ├── bugs.js · customers.js · dashboard.js · reports.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── firstPurchaseEmailService.js
│   │   └── inactiveCustomerEmailService.js
│   ├── db.js · firebaseAdmin.js · index.js
│   ├── seed.js                    # Product seed script
│   └── seedFitnessCenters.js
│
├── docs/
│   ├── CONTRIBUTING.md            # ← Start here if contributing
│   ├── SECURITY.md
│   └── FIRST_PURCHASE_EMAIL_SETUP.md
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB Atlas](https://www.mongodb.com/atlas) or local MongoDB
- [Firebase project](https://firebase.google.com/) (for auth)
- [Razorpay account](https://razorpay.com/) (for payments)
- [Gemini API key](https://aistudio.google.com/) (for chatbot)
- [RapidAPI / ExerciseDB](https://rapidapi.com/justin-thewebdev/api/exercisedb) (for exercises)
- SMTP provider like Gmail (optional — for emails)

### 1. Clone & Install

```bash
git clone https://github.com/parthbuilds-community/FitMart.git
cd FitMart
```

### 2. Setup Server

```bash
cd server
npm install
cp .env.example .env    # Fill in your values (see Environment Variables below)
npm run seed            # Seed products
npm run seed:fitness    # Seed fitness centers (optional)
npm run dev             # Starts at http://localhost:5000
```

### 3. Setup Client

```bash
# In a new terminal
cd client
npm install
# Create client/.env with your Firebase + Razorpay keys
npm run dev             # Starts at http://localhost:5173
```

---

## 🐳 Running with Docker

Run MongoDB + Express API + React (Nginx) with one command:

```bash
# 1. Fill in server env
cp server/.env.example server/.env

# 2. Create root .env with Vite variables (see below)

# 3. Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| React client | http://localhost |
| Node API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

Startup order: `mongodb` → healthcheck → `server` → healthcheck → `client`

```bash
docker compose down       # Stop
docker compose down -v    # Stop + wipe DB volume
```

---

## 🔑 Environment Variables

> ⚠️ Never commit `.env` files. They are already in `.gitignore`.

### `server/.env`

```env
# ── Required ──────────────────────────────────────────
MONGO_URI=your_mongodb_connection_string
PORT=5000

# ── Firebase Admin SDK ────────────────────────────────
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_UID=firebase_uid_of_admin_account

# ── Payments ──────────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ── AI Chatbot ────────────────────────────────────────
GEMINI_API_KEY=

# ── Exercise Library ──────────────────────────────────
RAPIDAPI_KEY=
RAPIDAPI_HOST=exercisedb.p.rapidapi.com

# ── Email (optional) ──────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@fitmart.com
APP_BASE_URL=http://localhost:5173

# ── CORS ──────────────────────────────────────────────
ALLOWED_ORIGIN=http://localhost:5173

# ── Redis (optional) ──────────────────────────────────
REDIS_URL=redis://localhost:6379
PRODUCTS_CACHE_TTL=60
```

> `MONGO_URI` is the only required variable. All others disable their feature gracefully if missing.

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
VITE_ADMIN_UID=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000`

> Authenticated endpoints require `Authorization: Bearer <firebase_id_token>`

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | — | Paginated listing. Params: `page`, `limit`, `category`, `search`, `sort`, `fields` |
| `GET` | `/api/products/:id` | — | Single product by `productId` |
| `POST` | `/api/products` | ✅ Admin | Create product |
| `PUT` | `/api/products/:id` | ✅ Admin | Update product |
| `DELETE` | `/api/products/:id` | ✅ Admin | Delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart/:userId` | — | Get or create cart |
| `POST` | `/api/cart/:userId/add` | — | Add item `{ productId, quantity }` |
| `POST` | `/api/cart/:userId/remove` | — | Remove item `{ productId, quantity }` |
| `DELETE` | `/api/cart/:userId` | — | Clear cart + release stock |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | — | Create order `{ userId, items? }` |
| `GET` | `/api/orders/:userId` | — | List user orders |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payment/create-order` | — | Create Razorpay order |
| `POST` | `/api/payment/verify-payment` | — | HMAC verification + trigger welcome email |
| `POST` | `/api/payment/clear-cart` | — | Release stock + clear cart |
| `POST` | `/api/payment/demo-success` | — | Simulate payment (dev only) |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/user/login` | — | Sync Firebase email, check discount |
| `GET` | `/api/user/profile/:userId` | ✅ | Get profile |
| `PUT` | `/api/user/profile/:userId` | ✅ | Update profile |
| `POST` | `/api/user/profile/:userId/addresses` | ✅ | Add address |
| `PUT` | `/api/user/profile/:userId/addresses/:addressId` | ✅ | Update address |
| `DELETE` | `/api/user/profile/:userId/addresses/:addressId` | ✅ | Delete address |
| `PUT` | `/api/user/profile/:userId/default-address` | ✅ | Set default address |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | AI chatbot — `{ message }` → `{ reply }` |
| `GET` | `/api/exercises?category=<name>` | Exercises by muscle group |
| `GET` | `/api/fitness-centers/nearby` | Gyms ranked by distance |
| `POST` | `/api/bugs` | Submit bug report |
| `GET` | `/api/bugs` | List all bugs (admin) |
| `PATCH` | `/api/bugs/:id/status` | Update bug status (admin) |
| `GET` | `/api/dashboard?range=today\|week\|month` | Admin dashboard data |
| `GET` | `/api/reports/sales?range=daily\|weekly\|monthly` | Sales reports |
| `GET` | `/api/customers` | All customers (admin) |

---

## 🗃️ Data Models

<details>
<summary><strong>Product</strong></summary>

```js
{
  productId:     Number,   // unique
  name:          String,
  brand:         String,
  category:      String,   // "Equipment" | "Nutrition" | "Wearables"
  price:         Number,
  originalPrice: Number,
  rating:        Number,   // 0–5
  reviews:       Number,
  badge:         String,   // "Best Seller" | "New" | etc.
  image:         String,   // URL
  stock:         Number | null,   // null = unlimited
  reserved:      Number    // units in active carts
}
```
</details>

<details>
<summary><strong>Order</strong></summary>

```js
{
  userId:    String,
  items: [{ productId, quantity, price }],  // price snapshotted at purchase
  total:     Number,
  status:    String,   // "created" | "paid" | "failed"
  createdAt: Date
}
```
</details>

<details>
<summary><strong>UserProfile</strong></summary>

```js
{
  userId:                   String,   // Firebase UID
  email:                    String,
  name:                     String,
  phone:                    String,
  isFirstLogin:             Boolean,
  discountUsed:             Boolean,
  discountPercent:          Number,   // default: 10
  firstPurchaseEmailSentAt: Date,
  lastReminderEmailSentAt:  Date,
  addresses: [{ id, label, line1, line2, city, state, zip, country, phone }],
  defaultAddressId:         String
}
```
</details>

<details>
<summary><strong>Bug · Cart · FitnessCenter</strong></summary>

```js
// Bug
{ title, description, steps, pageUrl, browser,
  reporterName, reporterEmail,
  status: "open" | "in-progress" | "resolved" }

// Cart
{ userId, items: [{ productId, quantity }] }

// FitnessCenter
{ name, type: "gym"|"yoga"|"pilates"|"fitness_studio",
  address, city, state, lat, lng, rating, imageUrl, contact, isOpen }
```
</details>

---

## 👑 Admin Panel

Access is restricted to the Firebase UID set in `VITE_ADMIN_UID`. Sign in with that account and you'll be automatically redirected to `/admin/dashboard`.

| Route | What's There |
|---|---|
| `/admin/dashboard` | KPIs, revenue chart, top products, recent orders — Today / Week / Month |
| `/admin/inventory` | Stock levels, low-stock alerts, reserved vs available |
| `/admin/customers` | Segments: new / returning / high-value |
| `/admin/customers/:id` | Order history, total spend, first/last order |
| `/admin/reports` | Revenue by date, product performance ranking |
| `/admin/marketing` | Curated digital marketing strategy cards |
| `/admin/bugs` | Bug tracker with one-click `open → in-progress → resolved` |

---

## 🤝 Contributing

FitMart runs on community contributions. We welcome everyone — from first-timers making their debut PR to experienced devs tackling complex features.

### How to Contribute

```bash
# 1. Fork + clone
git clone https://github.com/YOUR_USERNAME/FitMart.git
cd FitMart

# 2. Create a branch (use issue number if available)
git checkout -b fix/issue-42-cart-bug
# or
git checkout -b feat/wishlist-feature

# 3. Make your changes, commit clearly
git commit -m "fix: resolve cart quantity reset on page refresh (#42)"

# 4. Push + open a PR
git push origin fix/issue-42-cart-bug
```

Then open a Pull Request against `main`. We review within **48 hours** and give constructive feedback.

### Contribution Guidelines

- **Read first:** [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — setup, conventions, and PR checklist
- **One PR, one concern** — keep changes focused
- **Commit style:** Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Test your changes** — run `npm run dev` and verify nothing is broken
- **No secrets** — never commit `.env`, API keys, or `serviceAccountKey.json`

### What Can You Contribute?

| Area | Examples |
|---|---|
| 🐛 **Bug fixes** | Cart issues, payment edge cases, UI glitches |
| ✨ **New features** | Wishlist, product reviews, order tracking |
| 🎨 **UI improvements** | Responsive fixes, animations, accessibility |
| 📖 **Docs** | Fix typos, improve setup guides, add examples |
| ⚡ **Performance** | Query optimization, lazy loading, caching |
| 🧪 **Tests** | Unit tests (Jest), E2E tests (Playwright) |
| 🌐 **i18n** | Multi-language support |

---

## 🟢 Good First Issues

New to open source or this codebase? These are great starting points:

| Label | What It Means |
|---|---|
| [`good first issue`](https://github.com/parthbuilds-community/FitMart/labels/good%20first%20issue) | Small, well-scoped tasks — perfect for beginners |
| [`help wanted`](https://github.com/parthbuilds-community/FitMart/labels/help%20wanted) | We need help — any experience level welcome |
| [`documentation`](https://github.com/parthbuilds-community/FitMart/labels/documentation) | Docs-only changes — no code required |
| [`bug`](https://github.com/parthbuilds-community/FitMart/labels/bug) | Confirmed bugs ready to be fixed |
| [`enhancement`](https://github.com/parthbuilds-community/FitMart/labels/enhancement) | New features open for discussion or implementation |

**[→ Browse all open issues](https://github.com/parthbuilds-community/FitMart/issues)**

> 💡 **Tip:** Before starting work, comment on the issue to let others know you're on it. We'll assign it to you.

### Ideas for Bigger Contributions

Not finding something to pick up? Here are open feature ideas:

- **Wishlist / Save for Later** — add to `UserProfile` schema + new UI
- **Product Reviews** — star ratings + text reviews per product
- **Order Tracking Page** — status timeline UI for placed orders
- **Email Preferences** — let users opt out of re-engagement emails
- **Dark Mode** — toggle using Tailwind's `dark:` variant
- **Workout Sync to Server** — move localStorage workouts to MongoDB
- **Playwright E2E Tests** — cover checkout + payment flow
- **Admin: Product CRUD UI** — add/edit products from the admin panel

---

## 👥 Contributors

Every contribution matters — code, docs, bug reports, or ideas. Thank you! 🙏

<a href="https://github.com/parthbuilds-community/FitMart/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=parthbuilds-community/FitMart" alt="FitMart Contributors" />
</a>

Want your name here? [Start contributing →](https://github.com/parthbuilds-community/FitMart/issues?q=is%3Aopen+label%3A%22good+first+issue%22)

---

## 📝 Notes for Contributors

- **Hardcoded URLs** — Replace any `http://localhost:5000` with `VITE_API_URL`. Great first contribution!
- **Cart reservation** — `Product.reserved` uses atomic `findOneAndUpdate` — don't bypass this with direct saves
- **Demo payment** — The "Simulate Success" button on `/payment` must be removed or guarded before production
- **Admin guard** — UID-based for now; RBAC via DB roles is a planned improvement
- **Workout data** — Currently `localStorage` only. Syncing to MongoDB is an open feature
- **Rate limits** — API: 100 req / 15 min. Payments: 20 req / 15 min. Don't remove these in PRs
- **Email** — If SMTP vars are missing, emails silently skip. Safe to develop without them

---

## 📄 License

Licensed under the **[MIT License](LICENSE)** — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ by [Parth Narkar](https://github.com/parthnarkar) and the [Parth Builds Community](https://www.instagram.com/parth.builds/)

⭐ **Star this repo** if FitMart helped you — it helps the community grow!

**[🚀 Live Demo](https://fitmart-omega.vercel.app/) · [🐛 Issues](https://github.com/parthbuilds-community/FitMart/issues) · [📖 Contribute](docs/CONTRIBUTING.md)**

</div>