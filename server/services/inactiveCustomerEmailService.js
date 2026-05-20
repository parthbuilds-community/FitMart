// server/services/inactiveCustomerEmailService.js
const Order = require("../models/Order");
const UserProfile = require("../models/UserProfile");
const admin = require("../firebaseAdmin");
const { sendEmail } = require("./emailService");
const { generateInactivityReminderEmail } = require("./emailTemplates");

/**
 * Check if customer is inactive (no paid order in the last 30 days).
 * Returns { isInactive: boolean, lastOrderDate: Date|null, daysSinceLastOrder: number }
 */
async function checkInactivity(userId) {
  try {
    const lastPaidOrder = await Order.findOne(
      { userId, status: "paid" },
      { createdAt: 1 }
    ).sort({ createdAt: -1 });

    if (!lastPaidOrder) {
      return {
        isInactive: true,
        lastOrderDate: null,
        daysSinceLastOrder: null,
      };
    }

    const daysSince = Math.floor(
      (Date.now() - lastPaidOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isInactive: daysSince >= 30,
      lastOrderDate: lastPaidOrder.createdAt,
      daysSinceLastOrder: daysSince,
    };
  } catch (err) {
    console.error(`Error checking inactivity for user ${userId}:`, err.message);
    return {
      isInactive: false,
      lastOrderDate: null,
      daysSinceLastOrder: null,
    };
  }
}

/**
 * Resolve the customer's email and display name.
 */
async function resolveCustomerEmail(userId, existingProfile = null) {
  try {
    if (existingProfile?.email) {
      return {
        email: existingProfile.email,
        displayName: existingProfile.name || null,
      };
    }

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
 * Send inactivity reminder email to customer.
 * - Validates that customer is inactive (30+ days since last order)
 * - Resolves customer email from profile or Firebase
 * - Sends the reminder email
 * - Updates lastReminderEmailSentAt in profile
 *
 * @param {String} userId - Firebase UID
 * @returns {Promise<Object>} - { success: boolean, message: string, error?: string }
 */
async function sendInactivityReminderEmail(userId) {
  try {
    // Fetch user profile
    let profile = await UserProfile.findOne({ userId });

    // Check inactivity
    const { isInactive, daysSinceLastOrder } = await checkInactivity(userId);

    if (!isInactive) {
      return {
        success: false,
        error: "Reminder email can only be sent to customers inactive for at least 30 days",
      };
    }

    // Resolve customer email
    const { email, displayName } = await resolveCustomerEmail(userId, profile);
    if (!email) {
      console.warn(`⚠️  No email address found for user ${userId}`);
      return {
        success: false,
        error: "No email address available for this customer",
      };
    }

    // Generate email template
    const { subject, htmlTemplate, textTemplate } = generateInactivityReminderEmail({
      customerName: displayName || "Friend",
    });

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      html: htmlTemplate,
      text: textTemplate,
    });

    if (!result.success) {
      console.error(`❌ Failed to send reminder email to ${email}:`, result.error);
      return {
        success: false,
        error: result.error,
      };
    }

    // Update profile with timestamp
    await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { lastReminderEmailSentAt: new Date() } },
      { upsert: true, new: true }
    );

    console.log(`✅ Inactivity reminder email sent to ${email} for user ${userId} (${daysSinceLastOrder} days inactive)`);
    return {
      success: true,
      message: "Reminder email sent successfully",
      messageId: result.messageId,
    };
  } catch (err) {
    console.error(`❌ Error in sendInactivityReminderEmail for ${userId}:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  sendInactivityReminderEmail,
  checkInactivity,
  resolveCustomerEmail,
};
