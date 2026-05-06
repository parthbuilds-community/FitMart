// server/services/emailTemplates.js

/**
 * Generate the first-purchase thank-you email template.
 * @param {Object} options - { customerName, appBaseUrl }
 * @returns {Object} - { subject, previewText, htmlTemplate, textTemplate }
 */
function generateFirstPurchaseEmail(options = {}) {
  const { customerName = "Valued Customer", appBaseUrl = "https://fitmart-omega.vercel.app" } = options;

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
      background-color: #f4f6f9;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 30px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      margin: 0 auto 20px;
      display: block;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 48px 40px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 24px;
    }
    .features-heading {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 40px 0 24px 0;
      text-align: center;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 0 0 32px 0;
    }
    .feature-card {
      padding: 20px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      text-align: center;
      transition: transform 0.2s;
    }
    .feature-emoji {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
    }
    .feature-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 6px 0;
    }
    .feature-description {
      font-size: 12px;
      color: #718096;
      margin: 0;
      line-height: 1.5;
    }
    .signoff-section {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }
    .footer {
      background-color: #f7fafc;
      padding: 32px 40px;
      text-align: center;
      font-size: 13px;
      color: #a0aec0;
    }
    .footer-text {
      margin: 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 14px 32px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    @media (max-width: 600px) {
      .header {
        padding: 32px 20px;
      }
      .content {
        padding: 32px 24px;
      }
      .features-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .greeting {
        font-size: 18px;
      }
      .message {
        font-size: 14px;
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
      <img src="${appBaseUrl}/logo.png" alt="FitMart" class="logo" style="display: inline-block;">
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
      <h2 class="features-heading">What You Get With FitMart ✨</h2>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-emoji">🎯</span>
          <p class="feature-title">Weight Loss Plans</p>
          <p class="feature-description">Personalized guidance to help you reach your goals</p>
        </div>
        <div class="feature-card">
          <span class="feature-emoji">💪</span>
          <p class="feature-title">Muscle Building Plans</p>
          <p class="feature-description">Structured routines to build strength</p>
        </div>
        <div class="feature-card">
          <span class="feature-emoji">🧘</span>
          <p class="feature-title">Mobility & Recovery</p>
          <p class="feature-description">Enhance flexibility and speed up recovery</p>
        </div>
        <div class="feature-card">
          <span class="feature-emoji">📊</span>
          <p class="feature-title">Workout Tracker</p>
          <p class="feature-description">Track your progress and stay consistent</p>
        </div>
        <div class="feature-card">
          <span class="feature-emoji">🤖</span>
          <p class="feature-title">Fitness Chatbot</p>
          <p class="feature-description">24/7 support and personalized advice</p>
        </div>
        <div class="feature-card">
          <span class="feature-emoji">🛒</span>
          <p class="feature-title">Premium Shopping</p>
          <p class="feature-description">Curated fitness gear and supplements</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${appBaseUrl}/dashboard" class="button">Start Your Journey →</a>
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
      <p class="footer-text" style="margin-top: 12px; font-size: 12px;">
        <a href="${appBaseUrl}/unsubscribe" style="color: #a0aec0; text-decoration: none;">Unsubscribe</a> | 
        <a href="${appBaseUrl}/privacy" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a>
      </p>
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

Weight Loss Plans - Personalized guidance to help you reach your weight goals
Muscle Building Plans - Structured routines to build strength and lean muscle
Mobility & Recovery Plans - Enhance flexibility and speed up recovery
Workout Routine Tracker - Track your progress and stay consistent
Exercise Selection Support - Find the perfect exercises for your goals
Nearest Fitness Center Locator - Discover gyms and fitness facilities nearby
Fitness Chatbot - 24/7 support and personalized fitness advice
Premium Fitness Shopping - Curated selection of fitness gear and supplements

Visit your dashboard: ${appBaseUrl}/dashboard

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
 * @param {Object} options - { customerName, daysInactive, appBaseUrl }
 * @returns {Object} - { subject, previewText, htmlTemplate, textTemplate }
 */
function generateInactivityReminderEmail(options = {}) {
  const { customerName = "Friend", daysInactive = 30, appBaseUrl = "https://fitmart.com" } = options;

  const subject = "✨ We've Missed You at FitMart! ✨";
  const previewText = `It's been ${daysInactive} days since your last visit. Come back and get 10% off your next purchase!`;

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
      color: #2d3748;
      background-color: #f4f6f9;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 30px;
      text-align: center;
      position: relative;
    }
    .logo {
      max-width: 140px;
      margin: 0 auto 20px;
      display: block;
      border-radius: 50%;
      background: white;
      padding: 10px;
    }
    .header h1 {
      font-size: 0;
      margin: 0;
      color: transparent;
    }
    .content {
      padding: 48px 40px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 20px;
      text-align: center;
    }
    .message {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 24px;
      text-align: center;
    }
    .days-badge {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      display: inline-block;
      margin: 20px auto;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
    }
    .offer-box {
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
      border-radius: 16px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .offer-badge {
      position: absolute;
      top: 10px;
      right: -30px;
      background: #ff6b6b;
      color: white;
      padding: 4px 40px;
      transform: rotate(45deg);
      font-size: 12px;
      font-weight: 600;
    }
    .offer-title {
      font-size: 28px;
      font-weight: 800;
      color: #2d3748;
      margin-bottom: 12px;
    }
    .offer-discount {
      font-size: 48px;
      font-weight: 800;
      color: #ff6b6b;
      margin: 12px 0;
    }
    .offer-code {
      background: white;
      padding: 12px;
      border-radius: 50px;
      font-family: monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 2px;
      display: inline-block;
      margin-top: 16px;
      color: #2d3748;
    }
    .features-heading {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin: 40px 0 24px 0;
      text-align: center;
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0 0 32px 0;
    }
    .feature-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f7fafc;
      border-radius: 12px;
      transition: transform 0.2s;
    }
    .feature-icon {
      font-size: 28px;
      margin-right: 16px;
      min-width: 48px;
    }
    .feature-text {
      flex: 1;
    }
    .feature-name {
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 4px;
    }
    .feature-desc {
      font-size: 13px;
      color: #718096;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 40px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      margin: 20px 0;
      font-size: 18px;
      text-align: center;
      transition: transform 0.2s;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .signoff-section {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }
    .footer {
      background-color: #f7fafc;
      padding: 32px 40px;
      text-align: center;
      font-size: 13px;
      color: #a0aec0;
    }
    .footer-text {
      margin: 0;
    }
    .social-links {
      margin: 20px 0 0;
      text-align: center;
    }
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #a0aec0;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      .header {
        padding: 32px 20px;
      }
      .logo {
        max-width: 100px;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 22px;
      }
      .message {
        font-size: 14px;
      }
      .offer-title {
        font-size: 24px;
      }
      .offer-discount {
        font-size: 36px;
      }
      .offer-code {
        font-size: 16px;
      }
      .feature-item {
        padding: 12px;
      }
      .feature-icon {
        font-size: 24px;
        margin-right: 12px;
      }
      .cta-button {
        padding: 14px 32px;
        font-size: 16px;
      }
      .footer {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Logo (Center Aligned) -->
    <div class="header">
      <img src="${appBaseUrl}/logo.png" alt="FitMart" class="logo" style="display: inline-block;">
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hey ${escapeHtml(customerName)}! 👋</p>

      <p class="message">
        <span class="days-badge">⚡ ${daysInactive} Days Away ⚡</span>
      </p>

      <p class="message">
        We've noticed it's been a while since your last visit, and honestly... <strong>we've really missed you</strong>!
        Your fitness journey is important to us, and we want to help you get back on track.
      </p>

      <p class="message">
        Consistency is everything in fitness, and we're here to support you every step of the way. 
        Whether you're starting fresh or picking up where you left off, now is the perfect time to return!
      </p>

      <!-- Special Offer Box -->
      <div class="offer-box">
        <div class="offer-badge">🎁 SPECIAL OFFER</div>
        <div class="offer-title">Welcome Back!</div>
        <div class="offer-discount">10% OFF</div>
        <p style="color: #2d3748; margin: 12px 0;">Your next purchase of ₹999 or more</p>
        <div class="offer-code">WELCOMEBACK10</div>
        <p style="color: #718096; font-size: 12px; margin-top: 16px;">*Valid for 7 days only</p>
      </div>

      <!-- Why Come Back Section -->
      <h2 class="features-heading">Why You'll Love Being Back 💚</h2>
      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <div class="feature-text">
            <div class="feature-name">Fresh Product Launches</div>
            <div class="feature-desc">Check out our latest fitness gear, supplements, and accessories</div>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🏆</span>
          <div class="feature-text">
            <div class="feature-name">New Achievement System</div>
            <div class="feature-desc">Earn badges and rewards for your fitness milestones</div>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🤖</span>
          <div class="feature-text">
            <div class="feature-name">Enhanced AI Chatbot</div>
            <div class="feature-desc">Smarter recommendations and personalized workout plans</div>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📍</span>
          <div class="feature-text">
            <div class="feature-name">More Partner Gyms</div>
            <div class="feature-desc">50+ new fitness centers added near you</div>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${appBaseUrl}/shop?utm_source=email&utm_medium=inactivity&utm_campaign=reminder" class="cta-button">
          🛍️ Shop Now & Save 10%
        </a>
      </div>

      <!-- Signoff Section -->
      <div class="signoff-section">
        <p class="message">
          Don't let this offer slip away! Your fitness goals are waiting, and we'd love to be part of your journey again.
        </p>

        <p class="message">
          <strong>Ready to crush your goals? 💪</strong>
        </p>

        <p class="message">
          Warm regards,<br>
          <strong>Team FitMart</strong><br>
          <span style="font-size: 14px; color: #718096;">Your Fitness Companion</span>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">FitMart © 2026. All rights reserved.</p>
      <div class="social-links">
        <a href="${appBaseUrl}/social/facebook" class="social-link">📘 Facebook</a>
        <a href="${appBaseUrl}/social/instagram" class="social-link">📷 Instagram</a>
        <a href="${appBaseUrl}/social/twitter" class="social-link">🐦 Twitter</a>
      </div>
      <p class="footer-text" style="margin-top: 20px; font-size: 11px;">
        <a href="${appBaseUrl}/unsubscribe" style="color: #a0aec0; text-decoration: none;">Unsubscribe</a> | 
        <a href="${appBaseUrl}/privacy" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a> | 
        <a href="${appBaseUrl}/contact" style="color: #a0aec0; text-decoration: none;">Contact Us</a>
      </p>
      <p class="footer-text" style="margin-top: 16px; font-size: 11px;">
        FitMart, 123 Fitness Street, Wellness City, 560001
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textTemplate = `
FitMart

Hey ${customerName}! 👋

⚡ ${daysInactive} Days Away ⚡

We've noticed it's been a while since your last visit, and honestly... we've really missed you! Your fitness journey is important to us, and we want to help you get back on track.

Consistency is everything in fitness, and we're here to support you every step of the way. Whether you're starting fresh or picking up where you left off, now is the perfect time to return!

✨ SPECIAL OFFER: WELCOME BACK! ✨
Get 10% OFF your next purchase of ₹999 or more!
Use code: WELCOMEBACK10
*Valid for 7 days only

WHY YOU'LL LOVE BEING BACK:

• Fresh Product Launches - Check out our latest fitness gear, supplements, and accessories
• New Achievement System - Earn badges and rewards for your fitness milestones
• Enhanced AI Chatbot - Smarter recommendations and personalized workout plans
• More Partner Gyms - 50+ new fitness centers added near you

Visit the shop: ${appBaseUrl}/shop?utm_source=email&utm_medium=inactivity&utm_campaign=reminder

Don't let this offer slip away! Your fitness goals are waiting, and we'd love to be part of your journey again.

Ready to crush your goals? 💪

Warm regards,
Team FitMart
Your Fitness Companion

---
FitMart © 2026. All rights reserved.

Facebook: ${appBaseUrl}/social/facebook
Instagram: ${appBaseUrl}/social/instagram
Twitter: ${appBaseUrl}/social/twitter

Unsubscribe: ${appBaseUrl}/unsubscribe
Privacy Policy: ${appBaseUrl}/privacy
Contact Us: ${appBaseUrl}/contact

FitMart, 123 Fitness Street, Wellness City, 560001
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