# Local Development Admin Authentication (Contributor Guide)

This document explains how to configure and use the local development admin authentication added to FitMart. It is intentionally separate from production authentication (Google / Firebase) so contributors can test admin features locally without production credentials.

IMPORTANT: The local dev admin system is development-only and disabled when `NODE_ENV=production`.

Contents
- Prerequisites
- Environment variables
- How local admin auth works
- Creating `.env` files
- Running the client and server locally
- Using the local admin login
- Security notes
- Files added or modified

---

Prerequisites
- Node.js v20.19+ (see `.nvmrc` at the repo root — run `nvm use`)
- MongoDB running locally (or a configured remote DB)
- The project already uses Firebase for production auth — you do NOT need Firebase to use the local admin flow.

Environment variables (development)
Create two `.env` files: one for the `server` and one for the `client` (Vite uses `VITE_` prefixes). Example variables you should set for local dev:

Server `.env` (server/.env)
- `NODE_ENV=development`
- `MONGO_URI=mongodb://localhost:27017`
- `DEV_ADMIN_EMAIL=admin@example.com`  # Required for dev login endpoint
- `DEV_ADMIN_UID=dev-admin-uid`        # Optional, used for seeding and uid checks

Client `.env` (client/.env)
- `VITE_API_URL=http://localhost:5000`
- `VITE_DEV_ADMIN_EMAIL=admin@example.com`  # Should match server's DEV_ADMIN_EMAIL
- `VITE_DEV_ADMIN_UID=dev-admin-uid`        # Optional (not required for login UI)

Do NOT use production admin credentials in these files. These are for development only.

How the local admin auth works (high level)
- A new development-only API endpoint is available: `POST /api/dev/login` on the server. It is only registered when `NODE_ENV !== 'production'`.
- The endpoint verifies that the supplied email matches `DEV_ADMIN_EMAIL` configured on the server, and returns a lightweight token: `dev:<email>`.
- The client stores that token in `localStorage` under `dev_token` and uses it for API calls during development.
- Server middleware recognizes tokens that start with `dev:` when running in development, and sets `req.user` to a mock user object with `uid`, `email`, and `email_verified: true`.
- Admin middleware (`verifyAdmin`) was extended so that in development it also accepts the local dev admin (either by `DEV_ADMIN_EMAIL` or `DEV_ADMIN_UID`).
- No production Firebase flows are changed.

Creating `.env` files
1. Copy `server/.env.example` to `server/.env` and fill in required variables (at minimum: `MONGO_URI`, `DEV_ADMIN_EMAIL`).
2. Copy `client/.env.example` to `client/.env` and set `VITE_API_URL` and `VITE_DEV_ADMIN_EMAIL`.

Quick start (local)
1. Start MongoDB locally.
2. Start server:
   - cd server
   - npm install
   - npm run dev (or `node index.js`)
3. Start client:
   - cd client
   - npm install
   - npm run dev

Access the dev admin login page in the client (development only):
- `http://localhost:5173/dev-login` (if using default Vite port)

Using the local admin login
1. Open `/dev-login` in your browser (appears only in development).
2. Enter the same email as `DEV_ADMIN_EMAIL` on the server and submit.
3. The client receives a dev token and stores it in `localStorage`.
4. You can now visit `/admin/dashboard` and other admin pages while running locally.

How API calls use the dev token
- The client helper `src/utils/getAuthHeaders.js` will send the `dev_token` from localStorage as the `Authorization: Bearer <token>` header when `import.meta.env.MODE === 'development'`.
- Server middleware `verifyFirebaseToken` recognizes `dev:` tokens and sets `req.user` appropriately.

Security notes
- The dev token is NOT cryptographically signed and is intended for local development only.
- The development route `/api/dev/login` is not registered in production. It returns `403` if `NODE_ENV=production`.
- Do not commit `.env` files with real credentials. Keep secrets out of source control.

Files added / modified
- server/routes/devAuth.js (new) — development-only login endpoint
- server/middleware/verifyFirebaseToken.js — accepts `dev:` tokens in development
- server/middleware/verifyAdmin.js — allows dev admin email/uid in development
- server/index.js — registers dev route in development and seeds a dev user profile if configured
- server/.env.example — documented DEV_ADMIN_* vars
- client/src/components/DevAdminLogin.jsx (new) — development-only login UI
- client/src/utils/getAuthHeaders.js — reads `dev_token` from localStorage in development
- client/src/components/AdminRoute.jsx — allows dev session when `dev_token` is present
- client/.env.example — documented VITE_DEV_ADMIN_EMAIL / VITE_DEV_ADMIN_UID

If you want me to also wire a prominent link to `/dev-login` in the app UI (for contributors), I can add that.

Questions or next steps
- Would you like the dev login page added to the nav in development for easier access?
- Should I add an automated script to seed the dev user with more fields (roles, photo)?
