# FitMart Product Definition

> **Status:** Phase 0 proposal — awaiting maintainer approval  
> **Last updated:** 2026-11-10  
> **Source of truth for implementation:** [`ROADMAP.md`](../ROADMAP.md)  
> **Supersedes:** `docs/NEW_PLAN.md` ("Fitness Membership OS") — that plan is retired and must not be executed.

---

## 1. Product thesis

**FitMart is a small, correctness-first, open-source MERN commerce reference for a fitness-gear store.**

It exists to demonstrate how a commerce system keeps inventory, prices, payments, orders, and administrative truth consistent under real failure conditions. The storefront is deliberately narrow so the engineering can be deep.

**One-line description:**

> A focused MERN commerce reference that treats the money path as the product: server-authoritative pricing, reserved inventory, verified payments, idempotent order creation, and an admin view that reflects reality.

FitMart is **not** a live retail business, a fitness super-app, a membership platform, or a tutorial that hides the hard parts behind CRUD screens.

---

## 2. Why this product exists

Most MERN commerce examples stop at "products render, cart works, payment modal opens." They usually omit the parts that make commerce difficult:

- prices and totals that the client can change;
- inventory that can be oversold or stranded;
- payments that succeed while order creation fails;
- duplicate orders caused by retries or webhooks;
- authorization that trusts a user ID from the request body;
- an admin dashboard that reports numbers nobody can reconcile.

FitMart's differentiator is the **transactional spine**:

```text
catalog
  → cart (intent)
  → server-priced checkout quote
  → short-lived inventory reservation
  → provider payment
  → verified, idempotent payment capture
  → atomic order creation
  → immutable order history
  → administrative truth
```

Every visible feature must either support that spine or help a developer understand, test, or operate it. Features that do neither are removed.

---

## 3. Target users

### Primary user: the evaluating engineer

A developer, maintainer, or hiring manager reads the repository to answer questions such as:

- Does this person understand concurrency and failure modes?
- Are sensitive operations server-authoritative?
- Are payment and inventory operations idempotent and recoverable?
- Are tests verifying business invariants rather than only happy paths?
- Is the codebase small enough to understand and honest enough to trust?

FitMart is optimized for that evaluation. The README, architecture notes, test suite, and commit history are part of the product.

### Secondary user: the developer who wants a runnable baseline

A developer wants to clone the repository, start it locally, seed it, complete a test-mode purchase, and understand where to change the catalog, pricing, payment provider, or admin workflow.

The project should be a useful starting point, not a framework or a platform.

### Demo persona, not a market claim

The storefront includes a shopper persona so the flows are concrete:

- a customer browses fitness gear;
- adds items to a cart;
- checks out with a saved address;
- pays in the provider's test mode;
- sees the resulting order and history.

This persona is a **demonstration device**. There is no claim that FitMart has real customers, real revenue, real traffic, or product-market fit.

---

## 4. Problem being solved

### The visible problem

Small commerce applications often look complete while their money path is unsafe:

- The browser decides what to charge.
- A cart reserves stock forever if the shopper abandons it.
- A payment can be captured without an order, or an order can exist without a payment.
- A retry creates a second order.
- An admin can change stock without respecting active reservations.
- A user can read another user's orders by changing an ID.
- The dashboard reports a total that does not match the orders.

### The engineering problem

Those failures are not UI bugs. They are **state-machine and consistency bugs**. They require explicit ownership of:

- who computes prices;
- when inventory is held and released;
- which system is authoritative for payment state;
- how retries are deduplicated;
- which database operations must commit together;
- what happens when a dependency succeeds but the local write fails.

FitMart's purpose is to make those decisions visible and testable.

---

## 5. Value proposition

FitMart offers five things that a typical MERN demo does not:

1. **A server-authoritative money path.**
   The client never supplies the amount charged. A server-issued checkout quote fixes the lines, prices, currency, and reservation window.

2. **Inventory with a lifecycle.**
   Carts are intent, not reservations. Stock is held only for a short checkout window, released on expiry, and consumed atomically when an order is paid.

3. **Payment integrity.**
   The provider webhook and the client verification callback both feed one idempotent capture handler. Amount, currency, and payment state are checked against the quote. Retries do not create duplicate orders.

4. **Honest administration.**
   Admin views are backed by the same orders and payments customers see. The dashboard reports what the database contains, not a decorative approximation.

5. **A small, teachable codebase.**
   One storefront, one admin surface, one payment provider, one currency, and explicit architecture decisions. The interesting complexity is in the correct places.

---

## 6. Core workflows

### 6.1 Customer purchase workflow

1. **Browse catalog** — paginated product list, category filter, search, product detail.
2. **Manage cart** — add, change quantity, remove. Cart changes do not hold inventory.
3. **Start checkout** — choose a saved shipping address.
4. **Receive a quote** — the server validates the cart and address, recomputes every line from current product data, and creates a short-lived checkout quote with a reservation.
5. **Pay** — the server creates a provider order from the quote amount. The browser opens the provider's test-mode checkout.
6. **Verify or receive webhook** — the server verifies the provider signature, checks the captured amount and currency, and runs one idempotent capture handler.
7. **Order created** — the server atomically creates the order, consumes the reservation, decrements stock, snapshots the address and line prices, and removes the purchased lines from the cart.
8. **Order history** — the customer sees the order from server data, not from client navigation state.
9. **Expiry or failure** — an unpaid quote expires and releases stock. A captured payment that cannot be fulfilled is recorded and compensated according to the payment policy.

### 6.2 Admin workflow

1. **Sign in** — admin access is derived from a server-verified Firebase custom claim, not an environment UID or a hardcoded frontend constant.
2. **View dashboard** — paid revenue, order count, low-stock products, and recent orders from the same source of truth.
3. **Manage catalog** — create and edit products, archive products instead of destroying history, and keep prices in integer minor units.
4. **Manage inventory** — adjust physical stock with reservation-aware validation and an audit record.
5. **Inspect orders and payments** — see paid orders, payment attempts, and exceptions that need attention.
6. **Review customers and sales** — customer spend/order counts and time-bounded sales reports, with no invented segmentation or marketing claims.

### 6.3 Developer workflow

1. Clone the repository.
2. Copy the documented environment template.
3. Start MongoDB as a replica set (required for transactions) and the app with Docker Compose or local commands.
4. Seed a deterministic catalog.
5. Run server tests, client tests, lint, and build.
6. Complete a test-mode purchase using the documented provider test credentials.
7. Read the architecture, API, and operations documents before changing the money path.

---

## 7. Product boundaries

### In scope for v1.0

- A single-tenant storefront for physical fitness gear.
- One currency: INR, stored and calculated in integer paise.
- Firebase authentication for customers.
- Server-authoritative cart pricing and checkout quotes.
- Short-lived, transactional inventory reservations.
- Razorpay test-mode payment creation, verification, webhook handling, and compensation.
- Order creation, immutable order snapshots, and customer order history.
- Admin authentication, catalog management, inventory management, order/payment inspection, customer summaries, and sales reports.
- A small design system, responsive storefront, and accessible core flows.
- Docker-based local environment, deterministic seed data, CI, tests, and documentation.

### Explicitly out of scope for v1.0

- Memberships, subscriptions, recurring billing, programs, coaching, or cohorts.
- Workout tracking, workout calendars, notes, exercise libraries, or fitness-content feeds.
- AI chat, fitness advice, BMI/calorie calculators, or generated plans.
- Loyalty points, rewards, referrals, gamification, or engagement campaigns.
- Nearby gym/studio discovery or any mocked geolocation.
- Bug reporting, in-app support desks, admin bug triage, or GitHub statistics widgets.
- Profile-photo uploads or any media-upload pipeline.
- Multi-vendor marketplaces, multi-currency pricing, tax engines, shipping integrations, returns, or customer-facing refunds.
- Reviews, ratings, testimonials, or social proof that is not backed by real data.
- PWA installation, offline mode, native mobile apps, or push notifications.
- Real-money production operation, real customer acquisition, or claims of business impact.
- Microservices, Kubernetes, event streaming, or a generic plugin framework.

### Boundary rule

A feature stays only if it is required by the transactional spine or materially improves the ability to understand, test, or operate that spine. "It already exists" is not a reason to keep it.

---

## 8. Product principles

### Correctness over feature count

A smaller system with verified invariants is more valuable than a larger system with hidden inconsistencies.

### Server authority for sensitive decisions

Prices, discounts, totals, stock availability, payment amounts, ownership, and admin capability are decided on the server. The client displays and requests; it does not author.

### Explicit state machines

Quotes, reservations, payments, and orders have named states and legal transitions. "It is probably fine" is not a state.

### Idempotency by default

Any operation that can be retried — quote creation, payment capture, webhook handling, refund compensation — must be safe to repeat.

### Atomicity where the business requires it

Operations that must not partially succeed use a MongoDB transaction. Operations that do not need a transaction are not wrapped in one for appearance.

### No fake surfaces

No invented testimonials, fallback statistics, mock distances, dead buttons, or claims of capabilities that are not implemented.

### Right-sized engineering

Use the simplest design that satisfies the invariant. Do not add a queue, a repository layer, a state library, or a microservice until a concrete requirement justifies it.

### Documentation as part of the product

Architecture decisions record the alternative that was rejected and the trade-off accepted. A future maintainer should understand *why*, not only *what*.

---

## 9. Success criteria

FitMart v1.0 is successful when all of the following are true.

### Product truth

- Every feature listed in the README exists in the running application.
- No mock, placeholder, or invented data is presented as real.
- The storefront and admin surfaces show the same orders, stock, and payment states.
- Removed features leave no routes, models, pages, navigation entries, environment variables, or stale documentation.

### Money-path correctness

- The client cannot influence the amount charged or the order total.
- A quote fixes prices and reserves stock for a bounded window.
- Concurrent checkouts cannot oversell the same inventory.
- An abandoned quote releases its reservation.
- A payment is verified against the provider and the quote before an order is created.
- Duplicate verification/webhook deliveries produce exactly one order.
- A captured payment that cannot be fulfilled is visible and compensated according to a documented policy.
- Orders contain immutable line, price, address, and total snapshots.

### Security and authorization

- A customer can access only their own cart, quotes, orders, and profile.
- Admin operations require a server-verified admin claim.
- No development token, demo payment route, hardcoded UID, or open CORS fallback exists in the shipped code.
- Inputs are validated at the HTTP boundary.
- Secrets are supplied by environment, never committed.
- The threat model and known limitations are documented.

### Engineering quality

- Server tests cover the money-path invariants, concurrency, idempotency, expiry, and authorization.
- Client tests cover critical rendering and state transitions.
- Lint, tests, production build, Docker build, and dependency checks run in CI and block failures.
- The application starts from a clean clone using documented commands.
- Local MongoDB supports transactions.
- Health and readiness endpoints, request IDs, structured logs, and graceful shutdown are present.
- Critical API modules have meaningful coverage; coverage is not gamed for a global percentage.

### Communication

- The README explains what the project is and is not.
- Architecture, data model, API, operations, and security documents are current.
- Architectural decisions include alternatives and trade-offs.
- A new contributor can identify the money path and the tests that protect it without reading every file.

---

## 10. Governance and change control

- `ROADMAP.md` is the single source of truth for implementation order.
- `docs/SCOPE.md` is the source of truth for what is in and out of v1.0.
- Any proposal outside the v1.0 scope is deferred, not quietly added.
- Changes to the money path require tests that demonstrate the invariant being preserved.
- Removing a feature requires removing its code, data model, configuration, navigation, tests, and documentation together.
- v1.0 is frozen before release. After the release criteria are met, the project enters maintenance mode defined in `ROADMAP.md`.

---

## 11. What FitMart should feel like

A reader should come away with the impression of a **deliberately small system with an unusually well-defended center**.

Not: "Look how many features were built."

But: "This person understands what can go wrong when money, inventory, and retries meet, and they built the smallest coherent system that handles it."
