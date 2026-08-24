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
 * The caller/worker is responsible for determining whether this order
 * is the user's first purchase. This service intentionally does not
 * query paid orders because the job may be processed after subsequent
 * purchases have already been created.
 *
 * - Only sends if the first-purchase decision was already made upstream
 * - Only sends if firstPurchaseEmailSentAt is not already set
 * - Gracefully handles email send failures
 * - Updates firstPurchaseEmailSentAt after successful send
 *
 * @param {String} userId - Firebase UID
 * @param {Object} orderData - Order information (optional, for logging)
 * @returns {Promise<Object>} - { sent: boolean, message: string, error?: string }
 */
async function sendFirstPurchaseEmail(userId, orderData = {}) {
  try {
    // Fetch user profile
    const profile = await UserProfile.findOne({ userId });

    // Prevent duplicate first-purchase emails
    if (profile?.firstPurchaseEmailSentAt) {
      console.log(
        `ℹ️ First-purchase email already sent for user ${userId}`
      );

      return {
        sent: false,
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

    // Mark first-purchase email as sent
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