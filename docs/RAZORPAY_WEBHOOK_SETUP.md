# Razorpay Webhook Setup

The FitMart server includes a webhook endpoint that reliably processes successful payments even if the client browser closes or the user navigates away before the client-side `verify-payment` callback completes.

## Webhook URL

Configure your Razorpay Dashboard to send the `payment.captured` event to:

```
https://your-domain.com/api/payment/webhook
```

For local development with ngrok:

```
https://your-ngrok-subdomain.ngrok-free.app/api/payment/webhook
```

> **Note:** Only the `payment.captured` event is processed. Other events (including `order.paid`) are acknowledged with `200` but ignored for order creation. This avoids a race condition where `order.paid` may fire without a `payment_id`.

## Environment Variable

Add the following to your `server/.env` file:

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

The webhook secret is generated in the Razorpay Dashboard when you create a webhook. It is **not** the same as `RAZORPAY_KEY_SECRET`.

## Razorpay Dashboard Configuration

1. Go to the [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter the webhook URL (see above)
4. Set the secret (this becomes `RAZORPAY_WEBHOOK_SECRET`)
5. Select the following event:
   - **`payment.captured`** — fires when a payment is successfully captured
6. Save the webhook

## How It Works

1. When the server creates a Razorpay order (`POST /api/payment/create-order`), it includes `notes: { userId }` in the order payload.
2. When Razorpay captures the payment, it sends a `payment.captured` webhook event to `/api/payment/webhook`.
3. The server verifies the `x-razorpay-signature` header using HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`.
4. The server extracts the `userId` from `payload.payment.entity.notes.userId`.
5. If no order exists for this `paymentId` yet, the server creates the order from the user's cart, marks it as paid, awards FitRewards points, and sends the first-purchase email.
6. If the order was already created by the client-side `verify-payment` callback, the webhook detects the duplicate by `paymentId` and returns `200 "already_exists"` — the operation is idempotent.

## Idempotency & Race Conditions

- **Client callback arrives first, webhook arrives second:** The webhook finds the existing order by `paymentId` and returns `200 "already_exists"`. No duplicate order is created.
- **Webhook arrives first, client callback arrives second:** The webhook creates the order. The client callback's duplicate check (`Order.findOne({ paymentId })`) catches it and returns `{ success: true, message: "Order already created" }`. No duplicate order is created.
- **Cart was already cleared (e.g., by a concurrent request):** `createOrder()` throws `"Cart is empty"`. The webhook catches this and returns `200 "skipped"` to prevent Razorpay retries.

## Verifying the Setup

1. Set `RAZORPAY_WEBHOOK_SECRET` in your environment
2. Restart the server — check the startup logs for the optional env var warning (it will mention `RAZORPAY_WEBHOOK_SECRET` if not set)
3. Make a test payment using the FitMart checkout flow
4. Check the server logs for: `Webhook received: payment.captured`
5. Verify the order appears in the database with `status: "paid"` and the correct `paymentId`
