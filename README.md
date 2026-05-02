<div align="center">

<img 
  src="https://raw.githubusercontent.com/parthnarkar/FitMart/main/client/public/logo.png" 
  alt="FitMart" 
  width="100"
/>

# FitMart

### *Your All-in-One Fitness & Nutrition E-Commerce Platform*

> A full-stack MERN e-commerce application combining premium fitness gear, nutrition products, workout tracking, and seamless payments — built for learning, collaboration, and real-world use.

<br/>

[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2A5E?style=flat-square)](https://razorpay.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](docs/CONTRIBUTING.md)

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
- 🤖 AI-powered Fitness Chatbot powered by **Google Gemini 2.5 Flash**
- 🧮 BMI & TDEE Calculator with personalized product recommendations
- 🔥 Calorie Calculator for weight loss and muscle gain targets
- 🏋️ Workout Tracker with a FullCalendar-based fitness calendar
- 📓 Workout Notes with exercise logging and GIF previews (via ExerciseDB API)
- 📍 Nearby Fitness Centers discovery based on user's saved address
- 👤 User Profile with editable addresses and shipping management
- 🐛 In-app Bug Reporting system accessible to all users
- 📧 Automated transactional emails (first purchase welcome, inactivity re-engagement)
- 👑 Full Admin Panel with dashboard, inventory, reports, marketing strategies, customer management, and bug tracker
- 🎯 Welcome discount system for first-time buyers
- 🛡️ Rate limiting, Helmet security headers, and request logging middleware

Whether you're a beginner learning full-stack development or an experienced developer looking to contribute — **FitMart is built for you.**

---

## 🌐 Live Demo

<p align="center">
  <a href="https://fitmart-omega.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Launch%20FitMart-Live%20Now-black?style=for-the-badge" />
  </a>
</p>

🔗 https://fitmart-omega.vercel.app/

> 💡 Try exploring products, the workout tracker, the AI chatbot, and the admin panel for the full experience.

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
| 🤖 Fitness Chatbot | AI-powered assistant (Gemini 2.5 Flash) for workout and nutrition queries |
| 🧮 BMI Calculator | Body metrics tool with TDEE calculation and product recommendations |
| 🔥 Calorie Calculator | Weight loss and weight gain daily calorie targets |
| 🏋️ Workout Tracker | FullCalendar-based fitness calendar to plan and visualize sessions |
| 📓 Workout Notes | Log exercises per session with animated GIFs from ExerciseDB |
| 📍 Nearby Fitness Centers | Discover gyms, yoga studios, and fitness centers near you |
| 👤 User Profile | Manage personal info, shipping addresses, and default address |
| 🏋️ Fitness Plans | Weight Loss, Muscle Building, and Mobility & Recovery plans |
| 🐛 Bug Reporter | In-app bug reporting widget available to all signed-in users |
| 📧 Welcome Email | Automated first-purchase congratulations email |
| 📱 PWA Ready | Progressive Web App support for mobile installation |

### Admin-Facing

| Feature | Description |
|---|---|
| 📊 Dashboard | Revenue KPIs, charts, top products, and recent orders |
| 📦 Inventory | Real-time stock levels, low-stock alerts, and product filtering |
| 👥 Customers | Customer directory with segments (new / returning / high-value) |
| 🔍 Customer Detail | Full order history and spend analytics per customer |
| 📈 Reports | Sales reports with daily, weekly, and monthly breakdowns |
| 📣 Marketing | Curated digital marketing strategies tailored to FitMart |
| 🐛 Bug Tracker | View, manage, and update status of all user-submitted bug reports |

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
| **Framer Motion** | Smooth animations & transitions |
| **FullCalendar** | Interactive workout calendar (`@fullcalendar/react`) |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | REST API server |
| **Mongoose** | MongoDB ODM |
| **Firebase Admin SDK** | Server-side auth token verification |
| **Razorpay SDK** | Payment order creation and HMAC verification |
| **Nodemailer** | Transactional email delivery via SMTP |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API and payment endpoint rate limiting |
| **Google Gemini 2.5 Flash** | AI chatbot via `@google/generative-ai` |

### Database & Services

| Service | Usage |
|---|---|
| **MongoDB** (Atlas or local) | Primary database |
| **Firebase** | Authentication provider |
| **Razorpay** | Payment processing |
| **ExerciseDB (RapidAPI)** | Exercise library with animated GIFs |
| **SMTP Provider** | Transactional email (Gmail or any SMTP service) |

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
│   │   │   ├── CalorieCalculator.jsx  # Daily calorie target calculator
│   │   │   ├── CartDrawer.jsx     # Slide-in cart panel
│   │   │   ├── FitnessCenterDetail.jsx  # Fitness center detail modal
│   │   │   ├── FitnessChatBot.jsx # Floating AI chatbot (Gemini)
│   │   │   ├── Navbar.jsx         # Main navigation bar
│   │   │   ├── NearbyFitnessCenters.jsx  # Nearby gym/studio discovery
│   │   │   ├── NonAdminRoute.jsx  # Redirects admin away from customer pages
│   │   │   ├── ReportBugButton.jsx  # Floating bug report widget
│   │   │   ├── WelcomeBanner.jsx  # First-visit discount banner
│   │   │   └── WorkoutCalendar.jsx  # FullCalendar workout calendar
│   │   ├── pages/
│   │   │   ├── AdminBugs.jsx              # Admin bug tracker
│   │   │   ├── AdminCustomerDetail.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminInventory.jsx
│   │   │   ├── AdminMarketing.jsx         # Marketing strategy panel
│   │   │   ├── AdminReports.jsx
│   │   │   ├── Authentication.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── ExercisePage.jsx           # Browse exercises by muscle group
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MobilityRecoveryPlans.jsx
│   │   │   ├── MuscleBuildingPlans.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── NotesPage.jsx              # Workout logging / notes
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── PrivacyPolicy.jsx          # Privacy policy page
│   │   │   ├── ProductConfirmation.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── Profile.jsx                # User profile & addresses
│   │   │   ├── TermsAndConditions.jsx     # Terms of service page
│   │   │   ├── TrackerPage.jsx            # Workout tracker (calendar view)
│   │   │   └── WeightLossPlans.jsx
│   │   ├── utils/
│   │   │   ├── formatters.js       # Currency formatter (INR)
│   │   │   ├── getAuthHeaders.js   # Firebase token → Authorization header
│   │   │   ├── healthUtils.js      # BMI, BMR, TDEE, calorie calculations
│   │   │   ├── normalizeProduct.js # Normalizes productId/id field across responses
│   │   │   └── workoutStorage.js   # LocalStorage helpers for workout data
│   │   ├── App.jsx                # Root router
│   │   ├── index.css              # Tailwind import
│   │   └── main.jsx               # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js + Express Backend
│   ├── middleware/
│   │   ├── logger.js              # Colored request/response logger
│   │   └── verifyFirebaseToken.js # Firebase Bearer token middleware
│   ├── models/
│   │   ├── Bug.js                 # Bug report schema
│   │   ├── Cart.js                # Cart schema
│   │   ├── FitnessCenter.js       # Fitness center schema
│   │   ├── Order.js               # Order schema
│   │   ├── Product.js             # Product schema
│   │   └── UserProfile.js         # Extended user profile schema
│   ├── routes/
│   │   ├── bugs.js                # Bug reporting & admin management
│   │   ├── cart.js                # Cart management + stock reservation
│   │   ├── chat.js                # Gemini AI chatbot endpoint
│   │   ├── customers.js           # Customer management
│   │   ├── dashboard.js           # Admin dashboard data
│   │   ├── exercises.js           # ExerciseDB proxy (RapidAPI)
│   │   ├── fitnessCenters.js      # Nearby fitness center discovery
│   │   ├── orders.js              # Order creation and retrieval
│   │   ├── payment.js             # Razorpay integration
│   │   ├── products.js            # CRUD for products
│   │   ├── reports.js             # Sales reports
│   │   └── user.js                # Profile, discount, address management
│   ├── services/
│   │   ├── emailService.js              # Nodemailer SMTP transporter
│   │   ├── emailTemplates.js            # HTML/text email templates
│   │   ├── firstPurchaseEmailService.js # First-purchase welcome email logic
│   │   └── inactiveCustomerEmailService.js  # Re-engagement email service
│   ├── db.js                      # MongoDB connection
│   ├── firebaseAdmin.js           # Firebase Admin SDK setup
│   ├── index.js                   # Server entry point
│   ├── seed.js                    # Product DB seed script
│   └── seedFitnessCenters.js      # Fitness center DB seed script
│
├── docs/
│   ├── CONTRIBUTING.md
│   ├── FIRST_PURCHASE_EMAIL_SETUP.md  # Email feature setup guide
│   └── SECURITY.md                    # Responsible disclosure policy
│
└── README.md
```

---

## 🗺️ Pages & Routes

### Public / Customer Routes

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing homepage with hero, categories, plans, testimonials |
| `/auth` | `Authentication` | Sign In, Sign Up, and Password Reset |
| `/home` | `HomePage` | Product catalog with search, cart, BMI/calorie calculators, plans |
| `/product/:productId` | `ProductPage` | Individual product detail page |
| `/checkout` | `Checkout` | Order review with discount summary |
| `/payment` | `PaymentPage` | Razorpay payment flow + demo bypass |
| `/payment-confirmation` | `ProductConfirmation` | Post-payment success screen |
| `/profile` | `Profile` | User profile, name, phone, saved addresses |
| `/tracker` | `WorkoutTracker` | FullCalendar fitness calendar for planning sessions |
| `/notes` | `NotesPage` | Log workout details and add exercises for a chosen date |
| `/exercises` | `ExercisePage` | Browse exercises by muscle group with animated GIFs |
| `/plans/weight-loss` | `WeightLossPlans` | Weight loss program listing |
| `/plans/muscle-building` | `MuscleBuildingPlans` | Muscle building program listing |
| `/plans/mobility-recovery` | `MobilityRecoveryPlans` | Mobility & recovery program listing |
| `*` | `NotFound` | 404 fallback |

> **Note:** Privacy Policy and Terms & Conditions pages are also included and linked from the app footer.

### Admin Routes (guarded — admin UID only)

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | KPIs, revenue chart, top products, recent orders |
| `/admin/inventory` | `AdminInventory` | Stock levels with low-stock alerts |
| `/admin/customers` | `AdminCustomers` | All customers with segment tagging |
| `/admin/customers/:userId` | `AdminCustomerDetail` | Customer profile + full order history |
| `/admin/reports` | `AdminReports` | Sales reports (daily / weekly / monthly) |
| `/admin/marketing` | `AdminMarketing` | Curated digital marketing strategy cards |
| `/admin/bugs` | `AdminBugs` | View and manage user-submitted bug reports |

> **Route Guards:** `AdminRoute` redirects non-admins to `/home`. `NonAdminRoute` redirects the admin account to `/admin/dashboard`.

---

## 🧩 Components

### `Navbar`
Dual-variant navigation bar (`landing` / `home`). Landing variant is transparent and becomes opaque on scroll. Home variant is sticky with search, cart icon (with badge), user avatar dropdown, and links to Profile, Workout Tracker, and Exercises.

### `CartDrawer`
Slide-in panel from the right showing cart items with quantity controls, remove buttons, subtotal, and a checkout CTA. Closes on `Escape` key or overlay click. Locks body scroll when open.

### `FitnessChatBot`
Floating chat widget (FAB in bottom-right corner) backed by the `/api/chat` endpoint powered by **Google Gemini 2.5 Flash**. Supports markdown-style bold text rendering, typing indicator, and auto-scroll. Full-screen on mobile. Falls back to curated static responses when the API is unavailable.

### `BMICalculator`
Form-based calculator that computes BMI and TDEE from user inputs (weight, height, age, gender, activity level). Displays results with a product category recommendation that links to the store.

### `CalorieCalculator`
Computes daily calorie targets for weight loss and muscle gain using the Mifflin-St Jeor BMR formula. Displays maintenance, weight loss (−500 kcal), and weight gain (+500 kcal) targets side by side.

### `WorkoutCalendar`
Interactive fitness calendar built on **FullCalendar** (`@fullcalendar/react`). Displays logged workout sessions as calendar events. Clicking a date navigates to the Notes page for that day.

### `NearbyFitnessCenters`
Fetches gyms, yoga studios, pilates studios, and fitness centers from the backend and displays them ranked by proximity to the user's saved address. Clicking a card opens a detail modal.

### `ReportBugButton`
Floating bug report widget visible to authenticated users. Opens a modal form that posts directly to `/api/bugs`. Automatically attaches the user's name, email, and current page URL.

### `WelcomeBanner`
Top-of-page animated banner shown to first-time users. Displays the 10% welcome discount and dismisses via a POST to `/api/user/dismiss-banner`.

### `AdminNavbar`
Admin-specific sticky navbar with range selector buttons (Today / Week / Month), brand link, navigation to all admin pages, and user avatar dropdown with sign out.

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
- A [Google Gemini API key](https://ai.google.dev/) (for the AI chatbot)
- A [RapidAPI](https://rapidapi.com/justin-thewebdev/api/exercisedb) account with ExerciseDB access (for the exercises feature)
- An SMTP provider (e.g., Gmail) for transactional emails *(optional)*

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

Create a `.env` file in the `server/` folder (see [Environment Variables](#-environment-variables) below):

```bash
cp .env.example .env   # if available, or create manually
```

Seed the database with sample products:

```bash
npm run seed
```

Optionally seed fitness center data:

```bash
npm run seed:fitness
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
# Required
MONGO_URI=<your_mongodb_connection_string>
PORT=5000

# Optional — payment processing
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>

# Optional — database name override
MONGO_DB=<your_database_name>

# CORS
ALLOWED_ORIGIN=http://localhost:5173    # comma-separate multiple origins

# Firebase Admin SDK (required for auth middleware)
FIREBASE_PROJECT_ID=<your_firebase_project_id>
FIREBASE_CLIENT_EMAIL=<your_firebase_client_email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Admin UID (used by bug routes to guard admin actions)
ADMIN_UID=<firebase_uid_of_admin_account>

# AI Chatbot — Google Gemini
GEMINI_API_KEY=<your_gemini_api_key>

# Exercise library — RapidAPI ExerciseDB
RAPIDAPI_KEY=<your_rapidapi_key>
RAPIDAPI_HOST=exercisedb.p.rapidapi.com

# Transactional email — SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@fitmart.com
APP_BASE_URL=http://localhost:5173
```

> **Startup behaviour:** The server validates environment variables on startup. `MONGO_URI` is the only truly critical variable — the server will exit if it's missing. All other variables are optional; missing ones produce a warning and disable the corresponding feature gracefully.

#### Getting Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com) → **Project Settings** → **Service Accounts**
2. Select **Node.js** and click **"Generate new private key"**
3. A `.json` file downloads — copy these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (wrap in double quotes, keep all `\n`)
4. **Delete the `.json` file** — never commit it to GitHub

#### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in and click **"Get API key"**
3. Copy the key and add it as `GEMINI_API_KEY`

#### Getting a RapidAPI Key (ExerciseDB)

1. Create a free account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [ExerciseDB API](https://rapidapi.com/justin-thewebdev/api/exercisedb) (free tier available)
3. Copy your `X-RapidAPI-Key` and set it as `RAPIDAPI_KEY`

#### Setting Up Transactional Email (Optional)

See [`docs/FIRST_PURCHASE_EMAIL_SETUP.md`](docs/FIRST_PURCHASE_EMAIL_SETUP.md) for full instructions, including Gmail app password setup.

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

### Products

The seed script populates your MongoDB with sample fitness products across all categories (Equipment, Nutrition, Wearables):

```bash
cd server
npm run seed
```

Each seeded product includes: `productId`, `name`, `brand`, `category`, `price`, `originalPrice`, `rating`, `reviews`, `badge`, `image`, `stock`, and `reserved`.

### Fitness Centers

A separate seed script populates the `FitnessCenter` collection with sample gyms, yoga studios, pilates studios, and fitness centers:

```bash
cd server
npm run seed:fitness
```

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

> **Tip:** The client is pre-configured for Vercel deployment (`client/vercel.json` is included). The server can be deployed to Railway, Render, or any Node.js host.

---

## 📡 API Reference

**Base URL:** `http://localhost:5000` (or your `VITE_API_URL`)

> All authenticated endpoints require an `Authorization: Bearer <firebase_id_token>` header.

### 🛍️ Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | — | List all products (sorted by `productId`) |
| `GET` | `/api/products/:id` | — | Get product by `productId` |
| `POST` | `/api/products` | — | Create a new product |
| `PUT` | `/api/products/:id` | — | Update product by `productId` |
| `DELETE` | `/api/products/:id` | — | Delete product by `productId` |

### 🛒 Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart/:userId` | — | Get or create a user's cart |
| `POST` | `/api/cart/:userId/add` | — | Add item — body: `{ productId, quantity }` |
| `POST` | `/api/cart/:userId/remove` | — | Remove item — body: `{ productId, quantity }` |
| `DELETE` | `/api/cart/:userId` | — | Clear cart and release reserved stock |

### 📦 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | — | Create order — body: `{ userId, items? }` |
| `GET` | `/api/orders/:userId` | — | List all orders for a user |

### 💳 Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payment/create-order` | — | Create a Razorpay order |
| `POST` | `/api/payment/verify-payment` | — | Verify HMAC signature + trigger first-purchase email |
| `POST` | `/api/payment/clear-cart` | — | Release stock & clear cart — body: `{ userId }` |
| `POST` | `/api/payment/demo-success` | — | Simulate successful payment (testing only) |

> **Security:** Payment verification uses HMAC-SHA256 on `razorpay_order_id|razorpay_payment_id` with `RAZORPAY_KEY_SECRET`. Never expose this key to the client.

### 🤖 Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/chat` | — | Send a message — body: `{ message }` — returns `{ reply }` (powered by Gemini 2.5 Flash) |

### 👤 User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/user/login` | — | Register login, sync Firebase email, check welcome discount |
| `GET` | `/api/user/discount-status/:userId` | — | Get discount eligibility and percent |
| `POST` | `/api/user/use-discount` | — | Mark welcome discount as used |
| `POST` | `/api/user/dismiss-banner` | — | Dismiss the welcome banner |
| `GET` | `/api/user/profile/:userId` | ✅ | Get user profile (name, phone, addresses) |
| `PUT` | `/api/user/profile/:userId` | ✅ | Update user profile |
| `POST` | `/api/user/profile/:userId/addresses` | ✅ | Add a shipping address |
| `PUT` | `/api/user/profile/:userId/addresses/:addressId` | ✅ | Update a shipping address |
| `DELETE` | `/api/user/profile/:userId/addresses/:addressId` | ✅ | Delete a shipping address |
| `PUT` | `/api/user/profile/:userId/default-address` | ✅ | Set default shipping address |

### 🏋️ Exercises

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/exercises?category=<name>` | — | Fetch exercises by muscle group from ExerciseDB |

Supported `category` values: `chest`, `back`, `shoulders`, `cardio`, `abs`, `arms`, `legs`

### 📍 Fitness Centers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/fitness-centers/nearby` | ✅ | Get fitness centers ranked by proximity to user's address |
| `GET` | `/api/fitness-centers/nearby?type=<type>` | ✅ | Filter by type: `gym`, `yoga`, `pilates`, `fitness_studio` |

### 🐛 Bugs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bugs` | — | Submit a bug report (auth optional; enriches reporter info if token present) |
| `GET` | `/api/bugs` | ✅ Admin | List all bug reports |
| `PATCH` | `/api/bugs/:id/status` | ✅ Admin | Update bug status: `open`, `in-progress`, `resolved` |

### 📊 Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard?range=today\|week\|month` | — | Dashboard KPIs, charts, recent orders |
| `GET` | `/api/reports/sales?range=daily\|weekly\|monthly` | — | Sales summary + revenue by date + product performance |
| `GET` | `/api/customers` | — | All customers with order counts, spend, and segment |
| `GET` | `/api/customers/:userId` | — | Single customer profile + order history |

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

### UserProfile

```js
{
  userId:                   String  (unique, Firebase UID),
  isFirstLogin:             Boolean,
  discountUsed:             Boolean,
  discountPercent:          Number,   // default: 10
  email:                    String,   // synced from Firebase on login
  firstPurchaseEmailSentAt: Date,     // prevents duplicate welcome emails
  lastReminderEmailSentAt:  Date,     // tracks re-engagement emails
  name:                     String,
  phone:                    String,
  addresses: [{
    id:        String,
    label:     String,
    line1:     String,
    line2:     String,
    city:      String,
    state:     String,
    zip:       String,
    country:   String,
    phone:     String
  }],
  defaultAddressId: String,
  createdAt:        Date,
  updatedAt:        Date
}
```

### Bug

```js
{
  title:         String  (required),
  description:   String  (required),
  steps:         String,
  pageUrl:       String,
  browser:       String,
  reporterName:  String,
  reporterEmail: String,
  status:        String,  // "open" | "in-progress" | "resolved"
  createdAt:     Date,
  updatedAt:     Date
}
```

### FitnessCenter

```js
{
  name:     String  (required),
  type:     String, // "gym" | "yoga" | "pilates" | "fitness_studio"
  address:  String,
  city:     String,
  state:    String,
  lat:      Number,
  lng:      Number,
  rating:   Number, // 0–5
  imageUrl: String,
  contact:  String,
  isOpen:   Boolean
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

### Animations
- Page transitions powered by **Framer Motion**
- Micro-interactions for buttons, modals, and cart drawer
- Entrance animations for product cards and sections

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
- Quick navigation cards to Inventory, Customers, Reports, Marketing, and Bugs

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

**Marketing (`/admin/marketing`)**
- Curated digital marketing strategy cards tailored to FitMart's e-commerce context
- Each card covers: strategy overview, how it applies to FitMart, and key benefits

**Bug Tracker (`/admin/bugs`)**
- Table of all user-submitted bug reports
- Columns: title, reporter, page URL, browser, status, submission date
- One-click status transitions: `open` → `in-progress` → `resolved`
- Mobile-responsive card layout for small screens

---

## 📝 Notes & Recommendations

- **API URL consistency** — Use `VITE_API_URL` consistently across all client files. Replacing any remaining hardcoded `http://localhost:5000` references is a great first contribution!
- **Cart reservation** — `Product.reserved` increments on cart add and decrements on cart remove/clear. Orders finalize the reservation but don't re-release it — this is intentional.
- **Razorpay** — Always verify payments server-side with HMAC. Never expose `RAZORPAY_KEY_SECRET` to the client.
- **Firebase** — Only client-facing Firebase config keys go in the Vite `.env`. Never put service account credentials in the client `.env`.
- **Demo payment** — A "Simulate Success" bypass button is available on the payment page for testing without a real Razorpay transaction. Remove or guard this in production.
- **Admin UID** — The admin guard is purely UID-based. For production, consider role-based access control stored in your database.
- **Gemini chatbot** — The chatbot falls back to curated static responses when `GEMINI_API_KEY` is unset or the API is unavailable, so the widget is never broken for end users.
- **Email service** — The email service is fully optional. If SMTP variables are missing, emails are silently skipped and the rest of the purchase flow is unaffected.
- **Workout data** — Workout notes and calendar events are stored in `localStorage`. They are device-local and not synced to the server.
- **Security** — To report a vulnerability responsibly, see [`docs/SECURITY.md`](docs/SECURITY.md).
- **Rate limiting** — General API routes are limited to 100 requests per 15 minutes. Payment endpoints have a stricter limit of 20 requests per 15 minutes.

---

## 🤝 Contributing

We love contributions! FitMart is an open-source, community-driven project and contributions of all kinds are welcome — from fixing typos to building new features.

Please read **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for a full guide on:
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