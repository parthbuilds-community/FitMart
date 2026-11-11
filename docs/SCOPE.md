# FitMart v1.0 Scope

> **Status:** Phase 0 proposal — awaiting maintainer approval  
> **Last updated:** 2026-11-11  
> **Product definition:** [`docs/PRODUCT.md`](./PRODUCT.md)  
> **Implementation sequence:** [`ROADMAP.md`](../ROADMAP.md)  
> **Supersedes:** `docs/NEW_PLAN.md` — retired; not part of v1.0.

This document is decisive. A feature is retained only if it supports the commerce spine or materially improves the ability to understand, test, or operate that spine.

---

## 1. v1.0 scope summary

FitMart v1.0 is:

> One storefront, one admin surface, one currency, one payment provider, one transactional money path — written in TypeScript.

The store sells seeded fitness equipment, nutrition, and wearable products. Customers authenticate with Firebase, build a cart, receive a server-issued checkout quote, pay through Razorpay in test mode, and receive an immutable order. Administrators manage products and stock, inspect orders and payments, and read sales/customer summaries. The server and client are both TypeScript, with shared API types inferred from Zod schemas.

Everything else is removed.

---

## 2. Retained capabilities

These capabilities stay, but most are hardened rather than preserved as-is.

| Capability | v1.0 responsibility | Notes |
|---|---|---|
| Product catalog | List, search, filter, paginate, detail | Public read API; no unverified ratings/reviews |
| Product images | Display image URLs from seeded/admin data | No upload pipeline |
| Cart | Add, update quantity, remove, clear | Cart is **intent**, not a stock reservation |
| Firebase customer auth | Sign-in, token verification, profile bootstrap | Email verification enforced |
| Shipping addresses | CRUD through the customer profile | Address is snapshotted onto the order |
| Checkout quote | Server-priced, expiring, inventory-reserving | Single source of truth for payment amount |
| Razorpay payment | Provider order, checkout, signature verification, webhook | Test mode for the reference deployment |
| Orders | Immutable snapshots, history, detail | Created exactly once per captured payment |
| Admin dashboard | Revenue, orders, low stock, recent orders | Reads the same orders as the storefront |
| Admin catalog | Create, edit, archive products | Archive instead of hard delete |
| Admin inventory | Reservation-aware stock adjustment | Audit logged |
| Admin orders/payments | Inspect orders, payment attempts, exceptions | Read-only order status changes limited to fulfillment |
| Admin customers | Order count, spend, last order | No invented RFM/cohort claims |
| Admin reports | Time-bounded sales and product performance | Integer money, paid orders only |
| Design system | Stone palette, typography, reusable primitives | Retained, not expanded |
| Order-confirmation email | Sent after a paid order, env-gated, best effort | Not a correctness dependency; delivery is not guaranteed |
| Seed data | Deterministic catalog and demo state | No fake reservations or fake orders |
| Docker/CI | Reproducible local run and quality gates | Mongo replica set required |
| TypeScript | Server and client typechecked with `tsc`; client bundled by Vite | Strict mode at release; migrated incrementally; no new JS source |

---

## 3. Capabilities to refactor

These stay in concept but must be rebuilt around the new invariants.

| Current capability | Required v1.0 design | Why |
|---|---|---|
| Cart stock reservation | Remove reservation from cart; reserve only when a checkout quote is created | Abandoned carts currently strand stock indefinitely |
| Client-computed total | Server-issued quote with integer paise | Client currently sends `amount` and computes discounts |
| Razorpay `create-order` | Create from a persisted quote, never from a client amount | Prevent amount tampering and quote/order drift |
| `verify-payment` | Shared idempotent capture handler fed by both verification and webhook | Client callback alone is not reliable |
| `orderService.createOrder` | Transactional commit from a paid payment attempt and active quote | Current order creation is multi-step and non-atomic |
| Order model | Immutable line, price, address, and total snapshots | Current model omits address and discount/pricing breakdown |
| Admin authorization | Firebase custom claim and server middleware | Env UID and hardcoded frontend fallback are unsafe |
| User-derived routes | Derive user identity from the verified token | Current routes accept `userId` in body/params |
| Rewards purchase hook | Remove rewards entirely | Not part of commerce reference scope |
| Welcome discount | Remove | Adds promotion concurrency without supporting the core thesis |
| Profile photo upload | Remove | Cloudinary/media pipeline is unrelated to commerce correctness |
| Product rating/review display | Remove unverified fields and UI | Current values are seed metadata presented as social proof |
| Product delete | Archive product (`isActive: false`) | Preserve order history and referential clarity |
| Product cache | Cache public catalog reads only; invalidate on admin writes | Stock/quote decisions must never rely on stale cache |
| Logger | Structured, redacted, request-scoped | Current logger logs request bodies and has no request ID |
| Error handling | One error envelope with codes and status mapping | Current routes mix `{error}`, `{success}`, `{message}` |
| API client | One authenticated, typed client with normalized errors | Current pages use ad hoc `fetch` everywhere |
| Frontend guards | Redirect based on verified token claims and server responses | Current guard trusts local storage and a hardcoded UID |

---

## 4. Capabilities to remove

### 4.1 Fitness-management vertical

Remove from server, client, tests, seed, environment, and documentation:

- Workout tracker and workout calendar (`WorkoutLog`, `FullCalendar`, `TrackerPage`, `WorkoutCalendar`).
- Workout notes (`NotesPage`, `workoutStorage`, workout save/delete/add-exercise flows).
- Exercise library and ExerciseDB proxy (`/api/exercises`, `ExercisePage`, RapidAPI configuration).
- Static plan pages (`WeightLossPlans`, `MuscleBuildingPlans`, `MobilityRecoveryPlans`).
- BMI and calorie calculators (`BMICalculator`, `CalorieCalculator`, related input-validation tests).
- AI fitness chatbot (`/api/chat`, `FitnessChatBot`, Gemini configuration and fallback responses).
- Nearby fitness centers (`FitnessCenter`, `/api/fitness-centers`, `NearbyFitnessCenters`, `FitnessCenterDetail`, mocked distance logic).
- Any navigation, landing-page, README, or SEO copy presenting these as product capabilities.

### 4.2 Growth, loyalty, and engagement

- FitRewards model, routes, config, purchase crediting, balance UI, and tier logic.
- Rewards expiry, redemption, pagination, and workout/milestone point earners.
- Welcome discount banner, `useWelcomeDiscount`, `discountUsed`, `discountPercent`, `use-discount`, and first-order discount calculation.
- Admin marketing page and all static marketing strategy content.
- Inactivity/re-engagement email service and admin "send reminder" action.
- First-purchase-only email behavior; replace with a plain order-confirmation email for every paid order.
- GitHub stats proxy, fallback statistics, GitHub star widgets, and contributor-count UI.
- Static testimonials, invented customer names, fake quotes, and decorative social proof.

### 4.3 Support and internal tooling

- Bug reporter widget, screenshot upload, bug model, bug routes, admin bug tracker, and Cloudinary bug storage.
- GitHub stats and repository-statistics endpoints.
- Admin marketing and any admin navigation entries that do not map to a retained capability.
- Any dead buttons, placeholder links, "coming soon" cards, or modal flows with no backend.

### 4.4 Unsafe or false capabilities

- `POST /api/payment/demo-success` and the "Simulate Successful Payment" button.
- Development `dev:<email>` bearer-token bypass.
- `DevAdminLogin`, `/dev-login`, `dev_token` localStorage bypass, and dev admin seeding.
- Hardcoded admin UID fallback in `AdminRoute`.
- Environment-UID admin authorization as the primary mechanism.
- `ALLOW_ALL_ORIGINS` development behavior that accepts arbitrary origins.
- PWA claims and any manifest/service-worker references that do not exist.
- Rating/review counts that are not backed by a review system.
- Profile-photo upload and Cloudinary dependency.
- Any README claim, badge, screenshot, or API table that describes removed behavior.

### 4.5 Explicit non-goals

- Memberships, subscriptions, recurring billing, plans, programs, coaching, or cohorts.
- Appointments, classes, gym check-ins, streaks, or habit tracking.
- AI chat, generated advice, or recommendation engines.
- Loyalty, referrals, coupons, promotions, or discount engines.
- Multi-vendor, multi-currency, tax calculation, shipping-rate integration, or internationalization.
- Customer-facing returns, exchanges, cancellations, or refund workflows.
- Reviews, ratings, Q&A, testimonials, or user-generated content.
- Push notifications, PWA/offline support, native apps, or real-time chat.
- Microservices, Kubernetes, event streaming, GraphQL, tRPC, or a plugin system.
- A live production store, real payment capture, real customer data, or business-impact claims.

---

## 5. Target v1.0 surface

### 5.1 Customer routes

| Route | Purpose |
|---|---|
| `/` | Positioning and entry point |
| `/auth` | Firebase sign-in/sign-up |
| `/home` | Catalog with search, categories, pagination |
| `/product/:productId` | Product detail and add-to-cart |
| `/cart` | Cart review and quantity management |
| `/checkout` | Address selection, quote creation, provider checkout |
| `/orders` | Customer order history |
| `/orders/:orderId` | Server-fetched order detail |
| `/profile` | Name, phone, addresses |
| `/terms`, `/privacy-policy` | Legal pages, corrected to match actual data practice |

No `/payment` route that depends on React Router navigation state. Payment is a checkout action, and confirmation is an order-detail read.

### 5.2 Admin routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard |
| `/admin/products` | Catalog create/edit/archive |
| `/admin/inventory` | Stock adjustment and low-stock view |
| `/admin/orders` | Paid orders and fulfillment status |
| `/admin/payments` | Payment attempts and exceptions |
| `/admin/customers` | Customer order/spend summary |
| `/admin/reports` | Sales and product performance |

### 5.3 API families

| Family | Responsibility |
|---|---|
| `/api/auth/*` or `/api/me` | Session bootstrap, profile, addresses |
| `/api/products` | Public catalog and detail |
| `/api/cart` | Authenticated cart operations |
| `/api/checkout/quotes` | Create/read an expiring quote |
| `/api/payments` | Provider order creation, verification, webhook |
| `/api/orders` | Customer order list/detail |
| `/api/admin/products` | Admin catalog |
| `/api/admin/inventory` | Admin stock adjustment |
| `/api/admin/orders` | Admin order inspection/fulfillment |
| `/api/admin/payments` | Admin payment exception inspection |
| `/api/admin/customers` | Admin customer summary |
| `/api/admin/reports` | Admin sales reports |

The exact contract is defined in Phase 3 and expressed as TypeScript types inferred from Zod schemas, shared between the server and client. User IDs are never accepted from the client for ownership decisions; the server derives identity from the verified token.

### 5.4 Data entities

Retained or introduced:

| Entity | Purpose |
|---|---|
| `UserProfile` | Firebase UID mapping, name, phone, addresses |
| `Product` | Catalog, price in paise, stock, reserved count, active/archive state |
| `Cart` | Per-user purchase intent; no reservation |
| `CheckoutQuote` | Server-priced, expiring checkout intent and reservation owner |
| `PaymentAttempt` | Provider order/payment state and idempotency anchor |
| `Order` | Immutable paid-order snapshot and fulfillment status |
| `WebhookEvent` | Provider event deduplication record |
| `AdminAuditLog` | Admin stock/catalog/order actions |

Removed entities:

- `Rewards`
- `WorkoutLog`
- `Bug`
- `FitnessCenter`
- Any Program/Membership model from the retired plan.

---

## 6. Engineering capabilities v1.0 must demonstrate

The final product must visibly demonstrate all of the following.

### 6.1 Server-authoritative pricing

- A quote is computed from server-side product data.
- The client sends a quote ID, address ID, and cart intent — never `amount`.
- All money is integer paise; no floating-point arithmetic in the payment path.
- The payment provider order amount is derived from the quote.
- The captured payment amount and currency are reconciled with the quote before an order exists.

### 6.2 Inventory consistency

- `available = stock - active reserved`.
- The invariant `0 <= reserved <= stock` is enforced at the database operation.
- A checkout quote reserves all lines atomically or reserves none.
- Reservations expire and are released by an idempotent sweeper.
- Consuming a reservation decrements both `stock` and `reserved`.
- Concurrent checkouts cannot oversell the last unit.
- Admin stock changes respect active reservations.

### 6.3 Payment integrity

- Provider order creation is idempotent for an active quote.
- Signature verification happens on the server.
- Webhooks use the raw request body and a unique provider event ID.
- Client verification and webhook delivery feed the same capture handler.
- Duplicate capture attempts produce one order.
- A paid-but-unfulfillable outcome is recorded, visible to admin, and compensated by an idempotent refund path.
- No `demo-success`, fake payment ID, or bypass exists in shipped code.

### 6.4 Authorization

- Customer identity is derived from the verified Firebase token.
- A customer cannot read or mutate another customer's cart, quote, payment, order, or profile.
- Admin endpoints require a server-verified `admin` custom claim.
- Frontend guards are convenience only; server authorization is authoritative.
- Every protected route has a positive and negative integration test.

### 6.5 API contracts and errors

- Request bodies, params, and query strings are validated at the HTTP boundary.
- API request and response types are inferred from the same Zod schemas and shared between server and client.
- Errors use one documented envelope with a stable code, HTTP status, message, and request ID.
- Validation failures, conflicts, insufficient stock, expired quotes, unauthorized access, and provider failures are distinguishable.
- List endpoints define pagination and filtering semantics.
- State-changing endpoints that can be retried define idempotency behavior.

### 6.6 Testing that verifies invariants

- Concurrent quote creation for the last unit yields exactly one success.
- Concurrent removal/expiry cannot drive `reserved` below zero.
- Duplicate verification and webhook calls produce one order.
- A payment amount mismatch is rejected even with a valid signature.
- A payment captured after quote expiry enters a documented exception path and is refunded.
- An order cannot be read by another customer.
- A non-admin cannot call admin routes.
- Quote expiry releases reserved stock exactly once.
- Transactions roll back entirely when one line fails.

### 6.7 Operability

- Environment variables are validated at startup.
- The Express app is separable from the listener for tests.
- Readiness checks verify the database.
- Requests carry a request ID; logs are structured and redact secrets/PII.
- The process shuts down gracefully.
- The reservation sweeper is safe to run repeatedly and is documented for single-instance/reference deployment.
- Docker Compose starts a MongoDB replica set, the API, and the client.
- The seed is deterministic and does not invent reservations/orders.

### 6.8 Security

- No committed secrets.
- CORS is an explicit allowlist.
- Helmet/CSP is configured for the actual client and payment provider.
- Rate limits cover auth-adjacent, payment, and write endpoints.
- No request-body logging of tokens, signatures, or personal data.
- Dependencies are audited in CI.
- A threat model covers payment forgery, replay, IDOR, stock manipulation, admin escalation, and webhook abuse.
- Removed features remove their attack surface, not just their UI.

### 6.9 Reproducibility and documentation

- A clean clone can run the documented local setup.
- Docker is optional but supported.
- Seeded data is sufficient for a complete test-mode purchase.
- README, architecture, data model, API, operations, security, and contribution documents agree.
- ADRs record why alternatives were rejected.

### 6.10 Type safety

- All server and client source is TypeScript (`.ts`/`.tsx`); no `.js`/`.jsx` source files remain.
- `tsc --noEmit` passes for both packages and runs in CI.
- `strict` is enabled for both packages at release, including `noImplicitAny` and `strictNullChecks`.
- Money-path modules define discriminated unions for quote, payment, and order states.
- Domain types (`Money`, `QuoteStatus`, `PaymentStatus`, `OrderStatus`, API envelopes) live in one root `shared/` module consumed by both packages.
- No `any`, unchecked `as` casts, or `@ts-ignore` appear in the money path; any exception is documented and reviewed.
- Zod remains the runtime validator; TypeScript types are inferred from it rather than duplicated by hand.
- PropTypes are removed because TypeScript covers component props.
- Mongoose models, Express handlers, React Query hooks, and provider payloads have usable types without leaking provider SDK types into the domain.

---

## 7. Definition of done for scope

The scope is complete when:

1. Every retained capability has a working server path, client path, and test.
2. Every removed capability has no code, route, model, page, navigation entry, environment variable, dependency, test, or documentation reference.
3. The money-path invariants in Section 6 are covered by automated tests.
4. The admin surface reads the same order/payment data as the customer surface.
5. The repository is fully TypeScript, strict, and typechecked in CI.
6. The README describes only behavior that exists.
7. The repository passes the v1.0 release criteria in `ROADMAP.md`.

---

## 8. Scope change control

- New features are out of scope until v1.0 ships.
- A proposed feature must identify which v1.0 invariant it protects or which retained workflow it improves. If it does neither, it is deferred.
- A proposal to retain a currently existing feature must justify it against the same test.
- Removing a feature is part of the same change as removing its data model, configuration, navigation, tests, and documentation.
- The roadmap order may change only when a dependency or a newly discovered correctness issue requires it; the scope itself does not expand.
