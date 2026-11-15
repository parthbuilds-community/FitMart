# Admin Access

Admin access in FitMart v2.0.0 is a **Firebase custom claim**:

```json
{ "admin": true }
```

There is no admin UID list, no admin email, and no environment variable that
grants admin rights. The claim is set on the Firebase user record and arrives in
the user's signed ID token, which both the server and the client verify.

## Why claims instead of UIDs

The previous implementation read `ADMIN_UID`, `SUPER_ADMIN_UID`,
`DEV_ADMIN_EMAIL`, and `VITE_ADMIN_UID`. Those values were:

- duplicated across server, client, CI, and docs;
- baked into the client bundle, where anyone can read them;
- impossible to revoke without a redeploy; and
- bypassable by a development email check.

A custom claim is issued by Firebase, signed, verified by the Admin SDK, and can
be revoked instantly.

## Grant or revoke access

Run from `server/` with valid Firebase Admin credentials configured (the same
`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` used by
the API):

```bash
# Grant admin
npm run admin:claim -- <uid-or-email>

# Revoke admin
npm run admin:claim -- <uid-or-email> --revoke
```

The script accepts either a Firebase UID or an email address.

**The affected user must sign out and sign in again** before the claim appears
in their ID token. The client reads the claim on each auth state change, so a
page refresh is not enough.

## How it is enforced

| Layer | File | Behaviour |
|---|---|---|
| Token verification | `server/middleware/requireAuth.ts` | Verifies the Firebase ID token, rejects unverified email addresses, exposes `req.user` |
| Admin check | `server/middleware/requireAdmin.ts` | Requires `req.user.admin === true`; otherwise `403` |
| Profile ownership | `server/routes/user.js` | `isAdminUser()` reads the same claim, so admins can act on other profiles |
| Client guard | `client/src/components/AdminRoute.jsx` | Reads `getIdTokenResult().claims.admin` from the signed-in user |
| Client redirect | `client/src/components/NonAdminRoute.jsx` | Sends claim-holding admins to `/admin/dashboard` |
| Login routing | `client/src/pages/Authentication.jsx` | Sends claim-holding admins to the dashboard after sign-in |

Admin routes still verify the claim on the server on every request. Hiding a
button or guarding a route in React is a user-experience decision, never a
security boundary.

## Local development

Use a real Firebase account:

1. Sign in to the app locally with the account you want to be an admin.
2. Find its UID in the Firebase console (Authentication → Users).
3. Run `npm run admin:claim -- <uid>` from `server/`.
4. Sign out and sign in again.

There is no `/dev-login` route and no `dev_token` fallback. Those were removed in
v2.0.0 because they created a second, weaker authentication path.

## CI

CI does not need admin credentials. Tests mock `requireAuth` and `requireAdmin`,
so no admin UID or claim is set in the workflow.
