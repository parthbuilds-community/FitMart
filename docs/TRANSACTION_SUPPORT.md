# MongoDB Transaction Support for Cart Operations

## Status

Cart operations (`add`, `remove`, `clear`) are wrapped in `withCartTransaction()` in
`server/routes/cart.js`. This helper attempts a multi-document transaction that atomically
commits both the `Product.reserved` change and the `Cart` document update.

**Whether this provides full atomicity depends on your MongoDB deployment:**

| Deployment | Transactions | Behaviour |
|------------|-------------|-----------|
| Atlas M0 (free tier) | ❌ Not supported | Writes succeed individually; no rollback if server crashes between writes |
| Atlas M2+ | ✅ Supported | Full atomicity — both writes commit or both are rolled back |
| Local standalone (`mongodb://localhost:27017`) | ❌ Not supported | Same as M0 |
| Local replica set (`--replSet rs0`) | ✅ Supported | Full atomicity |

## What Happens Without Transactions

Without transactions, two failure scenarios remain possible:

**Scenario 1 — Crash after `adjustReserved`, before Cart update:**
`Product.reserved` is incremented but the cart item was never saved.
The stock appears reserved by nobody. It will remain "stuck" until a
reconciliation job or manual fix runs.

**Scenario 2 — Crash after Cart update, before `adjustReserved`:**
The cart shows an item but reserved was never incremented.
If the user later removes the item, `adjustReserved(-quantity)` tries to
decrement reserved for a unit that was never counted — but the `>= 0`
guard in `adjustReserved` (Task 3) prevents it from going negative.
The item can still be removed safely.

## How to Enable Full Transaction Support

### Option A — Upgrade Atlas Cluster

1. In MongoDB Atlas, go to your cluster → **...** → **Edit Configuration**
2. Upgrade from M0 (free) to M2 (paid, ~$9/month) or higher
3. No code changes needed — `withCartTransaction()` will automatically use
   transactions on the next deployment

### Option B — Local Replica Set (Development)

To test transactions locally:

```bash
# Stop your current mongod if running

# Start mongod as a single-node replica set
mongod --replSet rs0 --dbpath /data/db --bind_ip localhost

# In mongo shell, initiate the replica set
mongosh
> rs.initiate()
```

Then update your `MONGO_URI` in `.env`:
```
MONGO_URI=mongodb://localhost:27017/fitmart?replicaSet=rs0
```

Restart the server — transactions will now be fully active.

## Detecting Transaction Support at Runtime

The server logs a warning when a transaction commit fails due to deployment limitations:

```
[cart/add] No transaction support — individual writes succeeded
```

If you see this warning in production logs, it means transactions are unavailable.
Individual operations are still atomic (Task 3's `findOneAndUpdate` guarantee holds),
but Cart + Product atomicity is not guaranteed across server crashes.

## Retry Logic (Not Implemented)

MongoDB transactions can fail with `TransientTransactionError` under high concurrency.
The current implementation does **not** retry on this error — it propagates to the
route handler's catch block and returns 500.

For production hardening, implement a retry wrapper:

```js
async function withRetry(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isTransient = err.errorLabels &&
        err.errorLabels.includes('TransientTransactionError');
      if (isTransient && attempt < maxAttempts) {
        console.warn(`Transaction transient error, retrying (${attempt}/${maxAttempts})`);
        continue;
      }
      throw err;
    }
  }
}

// Usage:
await withRetry(() => withCartTransaction(async (session) => { ... }));
```

This is a follow-up improvement, not a blocker for the initial fix.

## Follow-up: `payment.js`

The `POST /api/payment/clear-cart` route (used after successful Razorpay checkout) clears the cart and releases stock, but it has not yet been wrapped in `withCartTransaction()`. Refactoring this route to use the atomic `adjustReserved` helper and transactions is documented as a follow-up task.
