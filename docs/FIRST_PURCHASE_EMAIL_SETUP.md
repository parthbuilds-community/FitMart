# First-Purchase Email Feature - Setup & Testing Guide

## Overview

The first-purchase email feature sends a welcome email to users after they successfully complete their first paid order on FitMart. The email is sent automatically from the backend, and email sending failures do not block the payment success flow.

## Architecture

### Components Created

1. **`server/services/emailService.js`** - Core email sending service
   - Initializes nodemailer transporter from SMTP env variables
   - Sends emails using the configured SMTP provider
   - Gracefully handles missing SMTP configuration

2. **`server/services/emailTemplates.js`** - Email template generator
   - Generates HTML and text versions of the first-purchase welcome email
   - Includes FitMart branding and feature highlights
   - Uses customizable placeholders for customer name and app URL

3. **`server/services/firstPurchaseEmailService.js`** - First-purchase email logic
   - Resolves user email from UserProfile or Firebase
   - Detects first paid orders (count === 1)
   - Prevents duplicate emails using `firstPurchaseEmailSentAt` timestamp
   - Sends the welcome email and updates the profile

4. **`server/models/UserProfile.js`** (Extended)
   - Added `email` field to store user email address
   - Added `firstPurchaseEmailSentAt` field for duplicate prevention

5. **`server/routes/payment.js`** (Updated)
   - `POST /api/payment/verify-payment` - Calls email service after order is marked paid
   - `POST /api/payment/demo-success` - Calls email service for test orders

6. **`server/routes/user.js`** (Updated)
   - `POST /api/user/login` - Syncs Firebase email to UserProfile on user login

## Environment Variables

Add these to your `.env` file in the `server` directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com                    # Your SMTP server host
SMTP_PORT=587                               # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                           # true for port 465, false for port 587
SMTP_USER=your-email@gmail.com              # SMTP username/email
SMTP_PASS=your-app-password                 # SMTP password or app-specific password
SMTP_FROM=noreply@fitmart.com               # From address for emails
APP_BASE_URL=http://localhost:5173          # Client app URL (used in email CTA)
```

### Gmail Configuration Example

If using Gmail:
1. Enable 2-factor authentication on your Google Account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password (not your regular Gmail password) as `SMTP_PASS`
4. Set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`

### Other SMTP Providers

- **SendGrid**: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`, `SMTP_USER=apikey`, `SMTP_PASS=<api_key>`
- **Mailgun**: `SMTP_HOST=smtp.mailgun.org`, `SMTP_PORT=587`
- **AWS SES**: `SMTP_HOST=email-smtp.<region>.amazonaws.com`, `SMTP_PORT=587`

## How It Works

### Flow for Paid Orders

1. **User completes payment** via Razorpay (real payment) or demo-success (testing)
2. **Order is created** with `status: "paid"` and a `paymentId`
3. **First-purchase email service is triggered** (asynchronously, doesn't block response)
4. **Service checks:**
   - Does the user have a `firstPurchaseEmailSentAt` timestamp? If yes, skip (already sent)
   - Is this the user's first paid order? (count paid orders = 1)
5. **If conditions are met:**
   - Resolve user email from UserProfile or Firebase
   - Render email template with user's name and app URL
   - Send via configured SMTP provider
   - Update UserProfile with `firstPurchaseEmailSentAt` to prevent duplicates
6. **If email fails:** Log error but don't fail the payment response (graceful degradation)

### Email Content

**Subject:** "Thank You for Choosing FitMart"

**Preview Text:** "Your first FitMart order is confirmed. Explore plans, workout tracking, nearby fitness centers, and more."

**Email Highlights:**
- FitMart branding and personalized greeting
- Thank you message and platform value proposition
- Feature highlights grid:
  - Weight Loss Plans
  - Muscle Building Plans
  - Mobility & Recovery Plans
  - Workout Routine Tracker
  - Exercise Selection Support
  - Nearest Fitness Center Feature
  - Fitness Chatbot
  - Premium Fitness Shopping
- Call-to-action button: "Explore FitMart Now" (links to APP_BASE_URL)
- Footer with copyright and additional CTA

## Testing the Implementation

### Prerequisites

1. **SMTP Configuration:**
   - Set up `.env` with valid SMTP credentials
   - Test SMTP connection before proceeding

2. **MongoDB:**
   - Ensure MongoDB is running and connected
   - Database should have Order and UserProfile collections

3. **Firebase:**
   - Firebase Admin SDK configured with valid credentials
   - Firebase project must be accessible

### Test Scenario 1: First Purchase via Demo Payment (Recommended)

**Setup:**
1. Start server: `npm run dev` (or `npm start`)
2. Start client at `http://localhost:5173`

**Steps:**
1. Log in to FitMart with a test user (Firebase auth)
2. Add items to cart
3. Go to checkout and payment page
4. Click "Test Payment" or use the demo-success endpoint
5. Complete the payment flow

**Verification:**
- Check server logs for:
  ```
  ✅ Email sent successfully to <email>
  ✅ First-purchase email sent successfully to <email> for user <userId>
  ```
- Check the user's email inbox for the FitMart welcome email
- Query MongoDB to verify UserProfile has `firstPurchaseEmailSentAt` set:
  ```javascript
  db.userprofiles.findOne({ userId: "<testUserId>" })
  // Should show: firstPurchaseEmailSentAt: ISODate("2026-04-14T...")
  ```

### Test Scenario 2: Test Duplicate Prevention

**Steps:**
1. Place another order for the same user (after first-purchase email was sent)
2. Complete payment

**Verification:**
- Server logs should show:
  ```
  ℹ️  First-purchase email already sent for user <userId>
  ℹ️  Not the first paid order for user <userId>; skipping email
  ```
- No duplicate email should be sent to the user

### Test Scenario 3: Missing SMTP Configuration

**Setup:**
1. Comment out SMTP env variables in `.env`
2. Restart server

**Steps:**
1. Complete a first purchase

**Verification:**
- Server logs should show:
  ```
  ⚠️  SMTP configuration is incomplete. Email sending is disabled.
  ```
- Order should complete successfully (email failure doesn't block payment)
- Payment confirmation screen should appear normally

### Test Scenario 4: Email Resolution Fallback

**Steps:**
1. Create a test user without an email address
2. Complete a first purchase

**Verification:**
- Server logs should show:
  ```
  ⚠️  No email address found for user <userId>; cannot send welcome email
  ```
- Order should still complete successfully
- No email sent (graceful failure)

## Manual Testing via API (Advanced)

### Using cURL or Postman

#### Step 1: Get Firebase Auth Token
```bash
# Use your Firebase client SDK to get an ID token
# Or use Firebase CLI: firebase auth:import credentials.json
```

#### Step 2: Create Test Order (Demo Success)
```bash
POST http://localhost:5000/api/payment/demo-success
Content-Type: application/json

{
  "userId": "test-user-id-123"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_DEMO_1713084000000",
  "order": {
    "_id": "...",
    "userId": "test-user-id-123",
    "items": [...],
    "status": "paid",
    "createdAt": "2026-04-14T..."
  }
}
```

#### Step 3: Monitor Server Logs
Watch for email-related logs:
```
✅ Email transporter initialized successfully
✅ Email sent successfully to <email>: <messageId>
✅ First-purchase email sent successfully to <email>
```

## Debugging

### Common Issues

**1. "SMTP configuration is incomplete"**
- Verify all SMTP env vars are set: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Check for typos in `.env`
- Restart server after editing `.env`

**2. "Failed to send email: Invalid login"**
- Verify SMTP credentials are correct
- If using Gmail, ensure you're using an App Password, not your Gmail password
- Check that 2FA is enabled on Gmail account

**3. "Failed to send email: Server does not support STARTTLS"**
- Try changing SMTP_PORT to 465 and SMTP_SECURE to true

**4. Email not sent but order succeeded**
- Check if `firstPurchaseEmailSentAt` is already set (duplicate prevention)
- Verify user email address is available in UserProfile or Firebase
- Check server logs for email service warnings

**5. "Cannot find module '../services/firstPurchaseEmailService'"**
- Ensure `server/services/` directory exists and files are created correctly
- Verify file paths match import statements in payment.js

### Enable Verbose Logging

Add these environment variables temporarily for debugging:

```env
DEBUG=nodemailer:*
NODE_DEBUG=assert,fs,net,stream
```

Then check logs for Nodemailer internals.

## Performance Considerations

1. **Email sending is asynchronous** - doesn't block payment response
2. **Transporter is cached** - SMTP connection is reused
3. **Duplicate prevention** - `firstPurchaseEmailSentAt` is checked before sending
4. **Firebase fetch is cached** - User data fetched on-demand (not stored redundantly)

## Production Deployment

### Recommendations

1. **Use a transactional email service:**
   - SendGrid, Mailgun, AWS SES, or similar
   - Better delivery rates and compliance
   - Built-in tracking and analytics

2. **Set `SMTP_SECURE=true` with port 465** for better security

3. **Use environment-specific `SMTP_FROM`:**
   - Dev: `noreply-dev@fitmart.com`
   - Prod: `noreply@fitmart.com`

4. **Monitor email logs:**
   - Log all email sends to a database
   - Track delivery status and failures
   - Set up alerts for email service outages

5. **Implement retries:** (Optional)
   - Consider adding a retry queue for failed emails
   - Use a background job system (e.g., Agenda, Bull)

6. **Update `APP_BASE_URL`:**
   - Dev: `http://localhost:5173`
   - Prod: `https://fitmart.com`

## Future Enhancements

1. **Email verification:** Verify email address before sending
2. **Unsubscribe link:** Add unsubscribe link to email footer
3. **Template customization:** Store email templates in database
4. **Analytics:** Track email opens and clicks
5. **A/B testing:** Test different email versions
6. **Localization:** Support emails in multiple languages
7. **Email scheduling:** Delay email send to optimal times
8. **Transactional logs:** Store all emails sent in MongoDB for audit trail

## Acceptance Criteria - Implementation Complete ✅

- ✅ SMTP is integrated on the server
- ✅ First-purchase thank-you email is sent after the user's first successful paid order
- ✅ Email is not sent on second/subsequent purchases
- ✅ Email sending does not break payment success if SMTP fails
- ✅ Real and demo payment flows both support this
- ✅ Environment variables are documented in `.env.example`
- ✅ Implementation is clean and production-ready
- ✅ Services are modular and reusable

## Files Modified/Created

```
server/
├── services/
│   ├── emailService.js (NEW)
│   ├── emailTemplates.js (NEW)
│   └── firstPurchaseEmailService.js (NEW)
├── models/
│   └── UserProfile.js (MODIFIED - added email and firstPurchaseEmailSentAt fields)
├── routes/
│   ├── payment.js (MODIFIED - added email sending to verify-payment and demo-success)
│   └── user.js (MODIFIED - added email sync on login)
├── index.js (MODIFIED - added SMTP vars to optional env vars list)
└── .env.example (MODIFIED - added SMTP configuration variables)
```

## Quick Reference

### Key Functions

```javascript
// emailService.js
sendEmail(mailOptions)                    // Send email via SMTP
getEmailTransporter()                     // Get/initialize transporter

// emailTemplates.js
generateFirstPurchaseEmail(options)       // Generate email HTML/text

// firstPurchaseEmailService.js
sendFirstPurchaseEmail(userId, orderData) // Main entry point - sends welcome email
resolveUserEmail(userId, profile)         // Get user email from profile or Firebase
isFirstPaidOrder(userId)                  // Check if this is user's first paid order
```

### Key Database Fields

```javascript
// UserProfile
{
  userId: String,                        // Firebase UID
  email: String,                         // User's email (synced from Firebase)
  firstPurchaseEmailSentAt: Date,        // When first-purchase email was sent
  // ... other fields ...
}

// Order
{
  userId: String,
  items: Array,
  total: Number,
  status: 'paid' | 'created' | 'failed',
  paymentId: String,                     // Razorpay or fake demo payment ID
  createdAt: Date,
  // ... other fields ...
}
```

---

**Implementation Date:** April 14, 2026
**Status:** Complete and ready for testing
