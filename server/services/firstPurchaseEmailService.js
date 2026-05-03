// server/services/firstPurchaseEmailService.js
const Order = require("../models/Order");
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

    console.warn(`⚠️  Could not resolve email for user ${userId}`);
    return { email: null, displayName: null };
  } catch (err) {
    console.error(`Error resolving email for user ${userId}:`, err.message);
    return { email: null, displayName: null };
  }
}

/**
 * Check if this is the user's first paid order.
 * Returns true if the number of paid orders is exactly 1.
 */
async function isFirstPaidOrder(userId) {
  try {
    const paidOrderCount = await Order.countDocuments({
      userId,
      status: "paid",
    });
    return paidOrderCount === 1;
  } catch (err) {
    console.error(`Error checking first paid order for ${userId}:`, err.message);
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
  try {
    // Fetch user profile
    let profile = await UserProfile.findOne({ userId });

    // Check if email was already sent
    if (profile?.firstPurchaseEmailSentAt) {
      console.log(`ℹ️  First-purchase email already sent for user ${userId}`);
      return {
        sent: false,
        message: "Email already sent for this user",
      };
    }

    // Check if this is really the first paid order
    const isFirst = await isFirstPaidOrder(userId);
    if (!isFirst) {
      console.log(`ℹ️  Not the first paid order for user ${userId}; skipping email`);
      return {
        sent: false,
        message: "Not the first paid order",
      };
    }

    // Resolve user email
    const { email, displayName } = await resolveUserEmail(userId, profile);
    if (!email) {
      console.warn(`⚠️  No email address found for user ${userId}; cannot send welcome email`);
      return {
        sent: false,
        message: "No email address available",
        error: "Email not found for user",
      };
    }

    // Generate email template
    const appBaseUrl = process.env.APP_BASE_URL || "https://fitmart.com";
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
      console.error(`❌ Failed to send first-purchase email to ${email}:`, result.error);
      return {
        sent: false,
        message: "Email send failed",
        error: result.error,
      };
    }

    // Update profile with timestamp
    await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { firstPurchaseEmailSentAt: new Date() } },
      { upsert: true, new: true }
    );

    console.log(`✅ First-purchase email sent successfully to ${email} for user ${userId}`);
    return {
      sent: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    };
  } catch (err) {
    console.error(`❌ Error in sendFirstPurchaseEmail for ${userId}:`, err.message);
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
