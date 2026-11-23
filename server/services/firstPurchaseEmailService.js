// server/services/firstPurchaseEmailService.js
const Order = require("../models/Order");
const UserProfile = require("../models/UserProfile");
const admin = require("../firebaseAdmin");
const { sendEmail } = require("./emailService");
const { generateFirstPurchaseEmail } = require("./emailTemplates");

function requireQueryString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

/**
 * Resolve the user's email from UserProfile or Firebase.
 * Returns { email, displayName } or { email: null, displayName: null } on failure.
 */
async function resolveUserEmail(userId, existingProfile = null) {
  const safeUserId = requireQueryString(userId, "userId");
  try {
    // Try to use profile email if available
    if (existingProfile?.email) {
      return {
        email: existingProfile.email,
        displayName: existingProfile.name || null,
      };
    }

    // Try to fetch from Firebase
    const firebaseUser = await admin.auth().getUser(safeUserId);
    if (firebaseUser?.email) {
      return {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null,
      };
    }

    console.warn("⚠️  Could not resolve email for user %s", userId);
    return { email: null, displayName: null };
  } catch (err) {
    console.error("Error resolving email for user %s:", userId, err.message);
    return { email: null, displayName: null };
  }
}

/**
 * Check if this is the user's first paid order.
 * Returns true if the number of paid orders is exactly 1.
 */
async function isFirstPaidOrder(userId) {
  const safeUserId = requireQueryString(userId, "userId");
  try {
    const paidOrderCount = await Order.countDocuments({
      userId: safeUserId,
      status: "paid",
    });
    return paidOrderCount === 1;
  } catch (err) {
    console.error("Error checking first paid order for %s:", userId, err.message);
    return false;
  }
}

/**
 * Send first-purchase email to user if conditions are met.
 * - Only sends if this is the user's first paid order
 * - Only sends if firstPurchaseEmailSentAt is not already set
 * - Gracefully handles email send failures (does not throw)
 * - Updates firstPurchaseEmailSentAt after successful send
 *
 * @param {String} userId - Firebase UID
 * @param {Object} orderData - Order information (optional, for logging)
 * @returns {Promise<Object>} - { sent: boolean, message: string, error?: string }
 */
async function sendFirstPurchaseEmail(userId, orderData = {}) {
  const safeUserId = requireQueryString(userId, "userId");
  try {
    // Fetch user profile
    let profile = await UserProfile.findOne({ userId: safeUserId });

    // Check if email was already sent
    if (profile?.firstPurchaseEmailSentAt) {
      console.log("ℹ️  First-purchase email already sent for user %s", userId);
      return {
        sent: false,
        message: "Email already sent for this user",
      };
    }

    // Check if this is really the first paid order
    const isFirst = await isFirstPaidOrder(safeUserId);
    if (!isFirst) {
      console.log("ℹ️  Not the first paid order for user %s; skipping email", userId);
      return {
        sent: false,
        message: "Not the first paid order",
      };
    }

    // Resolve user email
    const { email, displayName } = await resolveUserEmail(safeUserId, profile);
    if (!email) {
      console.warn("⚠️  No email address found for user %s; cannot send welcome email", userId);
      return {
        sent: false,
        message: "No email address available",
        error: "Email not found for user",
      };
    }

    // Generate email template
    const appBaseUrl = process.env.APP_BASE_URL;
    const { subject, htmlTemplate, textTemplate } = generateFirstPurchaseEmail({
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
      console.error("❌ Failed to send first-purchase email to %s:", email, result.error);
      return {
        sent: false,
        message: "Email send failed",
        error: result.error,
      };
    }

    // Update profile with timestamp
    await UserProfile.findOneAndUpdate(
      { userId: safeUserId },
      { $set: { firstPurchaseEmailSentAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    console.log("✅ First-purchase email sent successfully to %s for user %s", email, userId);
    return {
      sent: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    };
  } catch (err) {
    console.error("❌ Error in sendFirstPurchaseEmail for %s:", userId, err.message);
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
  isFirstPaidOrder,
};
