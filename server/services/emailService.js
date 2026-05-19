// server/services/emailService.js
const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Initialize and return a Nodemailer transporter.
 * Configuration is read from environment variables only.
 * If SMTP credentials are missing, returns null and logs a warning.
 */
function getEmailTransporter() {
  // If already initialized, return the cached transporter
  if (transporter) return transporter;

  // Check if SMTP configuration is present
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn(
      "⚠️  SMTP configuration is incomplete. Email sending is disabled. " +
      "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment."
    );
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log("✅ Email transporter initialized successfully");
    return transporter;
  } catch (err) {
    console.error("❌ Failed to initialize email transporter:", err.message);
    return null;
  }
}

/**
 * Send an email using the configured SMTP transporter.
 * @param {Object} mailOptions - { to, subject, html, text }
 * @returns {Promise<Object>} - Result object with { success, messageId, error }
 */
async function sendEmail(mailOptions) {
  const trans = getEmailTransporter();

  if (!trans) {
    return {
      success: false,
      error: "Email service not configured. Check SMTP environment variables.",
    };
  }

  const smtpFrom = process.env.SMTP_FROM || "noreply@fitmart.com";
  const finalOptions = {
    from: smtpFrom,
    ...mailOptions,
  };

  try {
    const info = await trans.sendMail(finalOptions);
    console.log(`✅ Email sent successfully to ${mailOptions.to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send email to ${mailOptions.to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getEmailTransporter,
  sendEmail,
};
