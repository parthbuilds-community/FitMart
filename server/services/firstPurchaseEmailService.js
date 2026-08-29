// server/services/firstPurchaseEmailService.js
const UserProfile = require("../models/UserProfile");
const admin = require("../firebaseAdmin");
const { sendEmail } = require("./emailService");
const { generateFirstPurchaseEmail } = require("./emailTemplates");

/**
 * Resolve the user's email from UserProfile or Firebase.
 * Returns { email, displayName } or { email: null, displayName: null } on failure.
 */
async function resolveUserEmail(userId, existingProfile = null) {
  try {
    // Try to use profile email if available
    if (existingProfile?.email) {
      return {
        email: existingProfile.email,
        displayName: existingProfile.name || null,
      };
    }

    // Try to fetch from Firebase
    const firebaseUser = await admin.auth().getUser(userId);

    if (firebaseUser?.email) {
      return {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null,
      };
    }

    console.warn(`⚠️ Could not resolve email for user ${userId}`);

    return {
      email: null,
      displayName: null,
    };
  } catch (err) {
    console.error(
      `Error resolving email for user ${userId}:`,
      err.message
    );

    return {
      email: null,
      displayName: null,
    };
  }
}

/**
 * Send first-purchase email to user.
 *
 * The first-purchase decision is made during the payment/order flow
 * before the email job is added to BullMQ.
 *
 * The worker passes that decision through as `isFirstPurchase`.
 * This service intentionally does NOT count paid orders because the
 * job may be processed after subsequent purchases have been created.
 *
 * - Only sends when isFirstPurchase === true
 * - Skips when isFirstPurchase === false
 * - Prevents duplicate emails using firstPurchaseEmailSentAt
 * - Gracefully handles email send failures
 * - Does not retry an email after successful delivery if the
 *   database timestamp update fails
 *
 * @param {String} userId - Firebase UID
 * @param {Object} orderData - Order information
 * @param {Boolean} isFirstPurchase - First-purchase decision made at payment time
 * @returns {Promise<Object>}
 */
async function sendFirstPurchaseEmail(
  userId,
  orderData = {},
  isFirstPurchase
) {
  try {
    // The payment flow must explicitly determine first-purchase status.
    if (typeof isFirstPurchase !== "boolean") {
      console.error(
        `❌ Missing or invalid isFirstPurchase value for user ${userId}`
      );

      return {
        sent: false,
        message: "First-purchase status was not provided",
        error: "isFirstPurchase must be a boolean",
      };
    }

    // If the payment was not the user's first purchase, do nothing.
    if (!isFirstPurchase) {
      console.log(
        `ℹ️ Not the first purchase for user ${userId}; skipping email`
      );

      return {
        sent: false,
        skipped: true,
        message: "Not the first purchase",
      };
    }

    // Fetch user profile
    const profile = await UserProfile.findOne({ userId });

    // Prevent duplicate first-purchase emails
    if (profile?.firstPurchaseEmailSentAt) {
      console.log(
        `ℹ️ First-purchase email already sent for user ${userId}`
      );

      return {
        sent: false,
        skipped: true,
        message: "Email already sent for this user",
      };
    }

    // Resolve user email
    const { email, displayName } = await resolveUserEmail(
      userId,
      profile
    );

    if (!email) {
      console.warn(
        `⚠️ No email address found for user ${userId}; cannot send welcome email`
      );

      return {
        sent: false,
        message: "No email address available",
        error: "Email not found for user",
      };
    }

    // Generate email template
    const appBaseUrl = process.env.APP_BASE_URL;

    const { subject, htmlTemplate, textTemplate } =
      generateFirstPurchaseEmail({
        customerName: displayName || "Friend",
        appBaseUrl,
      });

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      html: htmlTemplate,
      text: textTemplate,
    });

    // Email provider reported failure
    if (!result.success) {
      console.error(
        `❌ Failed to send first-purchase email to ${email}:`,
        result.error
      );

      return {
        sent: false,
        message: "Email send failed",
        error: result.error,
      };
    }

    // Mark first-purchase email as sent.
    // If this update fails, DO NOT return an error because the email
    // has already been successfully delivered and BullMQ should not retry it.
    try {
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            firstPurchaseEmailSentAt: new Date(),
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );
    } catch (err) {
      console.error(
        `⚠️ Email sent successfully, but failed to update firstPurchaseEmailSentAt for ${userId}:`,
        err.message
      );

      return {
        sent: true,
        message:
          "Email sent successfully, but send-status update failed",
        warning: err.message,
      };
    }

    console.log(
      `✅ First-purchase email sent successfully to ${email} for user ${userId}`
    );

    return {
      sent: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    };
  } catch (err) {
    console.error(
      `❌ Error in sendFirstPurchaseEmail for ${userId}:`,
      err.message
    );

    return {
      sent: false,
      message: "Error occurred while sending email",
      error: err.message,
    };
  }
}

module.exports = {
  sendFirstPurchaseEmail,
  resolveUserEmail,
};