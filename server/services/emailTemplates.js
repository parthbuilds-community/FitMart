// server/services/emailTemplates.js

/**
 * Generate the first-purchase thank-you email template.
 * @param {Object} options - { customerName, appBaseUrl }
 * @returns {Object} - { subject, previewText, htmlTemplate, textTemplate }
 */
function generateFirstPurchaseEmail(options = {}) {
  const { customerName = "Valued Customer", appBaseUrl = "https://fitmart.com" } = options;

  const subject = "Thank You for Choosing FitMart";
  const previewText = "Your first FitMart order is confirmed. Explore plans, workout tracking, nearby fitness centers, and more.";

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      color: #3a3a3a;
      background-color: #f9f9f7;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e0;
      padding: 36px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #2a2a2a;
      margin: 0;
    }
    .content {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #2a2a2a;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #5a5a5a;
      line-height: 1.8;
      margin-bottom: 24px;
    }
    .features-heading {
      font-size: 16px;
      font-weight: 600;
      color: #2a2a2a;
      margin: 28px 0 20px 0;
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 0 0 24px 0;
    }
    .feature-block {
      padding: 16px;
      border-left: 4px solid #9c9c94;
      background-color: #f9f9f7;
      margin-bottom: 12px;
    }
    .feature-block:last-child {
      margin-bottom: 0;
    }
    .feature-title {
      font-size: 14px;
      font-weight: 600;
      color: #2a2a2a;
      margin: 0 0 6px 0;
    }
    .feature-description {
      font-size: 13px;
      color: #666666;
      margin: 0;
      line-height: 1.6;
    }
    .signoff-section {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e0;
    }
    .footer {
      background-color: #f9f9f7;
      border-top: 1px solid #e5e5e0;
      padding: 28px 30px;
      text-align: center;
      font-size: 13px;
      color: #8a8a84;
    }
    .footer-text {
      margin: 0;
    }
    @media (max-width: 600px) {
      .header {
        padding: 28px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 28px 20px;
      }
      .greeting {
        font-size: 16px;
      }
      .message {
        font-size: 14px;
      }
      .feature-block {
        padding: 14px;
      }
      .feature-title {
        font-size: 13px;
      }
      .feature-description {
        font-size: 12px;
      }
      .footer {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>FitMart</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${escapeHtml(customerName)},</p>

      <p class="message">
        Thank you for choosing <strong>FitMart</strong> for your fitness journey! We're thrilled that you've made your first purchase with us. This is just the beginning of a transformative experience.
      </p>

      <p class="message">
        FitMart is more than just a shopping platform—it's your comprehensive fitness companion designed to help you achieve your health and wellness goals.
      </p>

      <!-- Features Section -->
      <h2 class="features-heading">What You Get With FitMart</h2>
      <div class="features-list">
        <div class="feature-block">
          <p class="feature-title">Weight Loss Plans</p>
          <p class="feature-description">Personalized guidance to help you reach your weight goals</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Muscle Building Plans</p>
          <p class="feature-description">Structured routines to build strength and lean muscle</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Mobility & Recovery Plans</p>
          <p class="feature-description">Enhance flexibility and speed up recovery</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Workout Routine Tracker</p>
          <p class="feature-description">Track your progress and stay consistent</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Exercise Selection Support</p>
          <p class="feature-description">Find the perfect exercises for your goals</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Nearest Fitness Center Locator</p>
          <p class="feature-description">Discover gyms and fitness facilities nearby</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Fitness Chatbot</p>
          <p class="feature-description">24/7 support and personalized fitness advice</p>
        </div>
        <div class="feature-block">
          <p class="feature-title">Premium Fitness Shopping</p>
          <p class="feature-description">Curated selection of fitness gear and supplements</p>
        </div>
      </div>

      <!-- Signoff Section -->
      <div class="signoff-section">
        <p class="message">
          If you have any questions or need support, don't hesitate to reach out. We're here to help you succeed on your fitness journey.
        </p>

        <p class="message">
          Happy training!<br>
          <strong>The FitMart Team</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">FitMart © 2026. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textTemplate = `
FitMart

Hi ${customerName},

Thank you for choosing FitMart for your fitness journey! We're thrilled that you've made your first purchase with us. This is just the beginning of a transformative experience.

FitMart is more than just a shopping platform—it's your comprehensive fitness companion designed to help you achieve your health and wellness goals.

WHAT YOU GET WITH FITMART

Weight Loss Plans
Personalized guidance to help you reach your weight goals

Muscle Building Plans
Structured routines to build strength and lean muscle

Mobility & Recovery Plans
Enhance flexibility and speed up recovery

Workout Routine Tracker
Track your progress and stay consistent

Exercise Selection Support
Find the perfect exercises for your goals

Nearest Fitness Center Locator
Discover gyms and fitness facilities nearby

Fitness Chatbot
24/7 support and personalized fitness advice

Premium Fitness Shopping
Curated selection of fitness gear and supplements

If you have any questions or need support, don't hesitate to reach out. We're here to help you succeed on your fitness journey.

Happy training!
The FitMart Team

---
FitMart © 2026. All rights reserved.
  `.trim();

  return {
    subject,
    previewText,
    htmlTemplate,
    textTemplate,
  };
}

/**
 * Escape HTML special characters to prevent injection.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generate the inactivity reminder email template.
 * @param {Object} options - { customerName }
 * @returns {Object} - { subject, previewText, htmlTemplate, textTemplate }
 */
function generateInactivityReminderEmail(options = {}) {
  const { customerName = "Friend" } = options;

  const subject = "We've Missed You at FitMart";
  const previewText = "It's been over a month since your last purchase. Check out our latest offers and get back on track.";

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      color: #3a3a3a;
      background-color: #f9f9f7;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e0;
      padding: 36px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #2a2a2a;
      margin: 0;
    }
    .content {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #2a2a2a;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #5a5a5a;
      line-height: 1.8;
      margin-bottom: 24px;
    }
    .highlight-box {
      background-color: #f9f9f7;
      border-left: 4px solid #9c9c94;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .highlight-text {
      font-size: 14px;
      color: #2a2a2a;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .highlight-description {
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
    }
    .features-heading {
      font-size: 16px;
      font-weight: 600;
      color: #2a2a2a;
      margin: 28px 0 20px 0;
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 0 0 24px 0;
    }
    .feature-block {
      padding: 12px;
      border-left: 4px solid #9c9c94;
      background-color: #f9f9f7;
      margin-bottom: 10px;
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
    }
    .feature-block:last-child {
      margin-bottom: 0;
    }
    .signoff-section {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e0;
    }
    .footer {
      background-color: #f9f9f7;
      border-top: 1px solid #e5e5e0;
      padding: 28px 30px;
      text-align: center;
      font-size: 13px;
      color: #8a8a84;
    }
    .footer-text {
      margin: 0;
    }
    @media (max-width: 600px) {
      .header {
        padding: 28px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 28px 20px;
      }
      .greeting {
        font-size: 16px;
      }
      .message {
        font-size: 14px;
      }
      .highlight-box {
        padding: 14px;
      }
      .feature-block {
        padding: 10px;
      }
      .footer {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>FitMart</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${escapeHtml(customerName)},</p>

      <p class="message">
        It's been over a month since your last purchase from FitMart, and we've missed having you with us.
      </p>

      <p class="message">
        Consistency is a big part of every fitness journey, and we know how important it is to have the right products by your side. Whether you're restarting your routine, upgrading your essentials, or getting back on track, this is the perfect time to return.
      </p>

      <!-- Offer Highlight -->
      <div class="highlight-box">
        <p class="highlight-text">🎯 Special Offer Inside</p>
        <p class="highlight-description">Check out the latest offers and combo items currently available at FitMart. This is a great opportunity to stock up on your fitness essentials, supplements, accessories, and training gear.</p>
      </div>

      <!-- Features Section -->
      <h2 class="features-heading">Continue Your Fitness Journey With</h2>
      <div class="features-list">
        <div class="feature-block">• Weight Loss Plans</div>
        <div class="feature-block">• Muscle Building Plans</div>
        <div class="feature-block">• Mobility & Recovery Plans</div>
        <div class="feature-block">• Premium fitness products and essentials curated for your goals</div>
      </div>

      <!-- Signoff Section -->
      <div class="signoff-section">
        <p class="message">
          We'd love to welcome you back and continue being part of your progress.
        </p>

        <p class="message">
          Warm regards,<br>
          <strong>Team FitMart</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">FitMart © 2026. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textTemplate = `
FitMart

Hi ${customerName},

It's been over a month since your last purchase from FitMart, and we've missed having you with us.

Consistency is a big part of every fitness journey, and we know how important it is to have the right products by your side. Whether you're restarting your routine, upgrading your essentials, or getting back on track, this is the perfect time to return.

SPECIAL OFFER INSIDE

Check out the latest offers and combo items currently available at FitMart. This is a great opportunity to stock up on your fitness essentials, supplements, accessories, and training gear.

CONTINUE YOUR FITNESS JOURNEY WITH

• Weight Loss Plans
• Muscle Building Plans
• Mobility & Recovery Plans
• Premium fitness products and essentials curated for your goals

We'd love to welcome you back and continue being part of your progress.

Warm regards,
Team FitMart

---
FitMart © 2026. All rights reserved.
  `.trim();

  return {
    subject,
    previewText,
    htmlTemplate,
    textTemplate,
  };
}

module.exports = {
  generateFirstPurchaseEmail,
  generateInactivityReminderEmail,
};
