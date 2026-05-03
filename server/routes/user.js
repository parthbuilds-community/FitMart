// server/routes/user.js
const express = require("express");
const UserProfile = require("../models/UserProfile");
const admin = require("../firebaseAdmin");
const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/login
// Body: { userId }
// Called once after Firebase auth resolves.
// - If profile doesn't exist → create it (isFirstLogin: true) → return showBanner: true
// - If profile exists and isFirstLogin is true → flip it false → return showBanner: true
// - If profile exists and isFirstLogin is false → return showBanner: false
// Also syncs user email from Firebase to the profile for email sending.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Fetch Firebase user to get email and display name
    let firebaseEmail = null;
    let displayName = null;
    try {
      const firebaseUser = await admin.auth().getUser(userId);
      firebaseEmail = firebaseUser.email || null;
      displayName = firebaseUser.displayName || null;
    } catch (err) {
      console.warn(`Could not fetch Firebase user for ${userId}:`, err.message);
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // Brand new user — create profile with email, banner should show
      profile = await UserProfile.create({
        userId,
        email: firebaseEmail,
        name: displayName,
      });
      return res.json({
        showBanner: true,
        discountUsed: false,
        discountPercent: profile.discountPercent,
      });
    }

    // Sync email from Firebase if not already set
    if (firebaseEmail && !profile.email) {
      profile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: { email: firebaseEmail, name: displayName || profile.name } },
        { new: true }
      );
    }

    if (profile.isFirstLogin) {
      // Seen the app before but hasn't dismissed banner yet
      // (e.g. closed tab before seeing it)
      return res.json({
        showBanner: true,
        discountUsed: profile.discountUsed,
        discountPercent: profile.discountPercent,
      });
    }

    // Returning user — no banner
    return res.json({
      showBanner: false,
      discountUsed: profile.discountUsed,
      discountPercent: profile.discountPercent,
    });
  } catch (err) {
    console.error("user/login error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/dismiss-banner
// Body: { userId }
// Called when user dismisses the welcome banner.
// Flips isFirstLogin → false so it never shows again.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/dismiss-banner", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { isFirstLogin: false } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("user/dismiss-banner error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/use-discount
// Body: { userId }
// Called after a successful first order.
// Flips discountUsed → true so it can't be used again.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/use-discount", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const profile = await UserProfile.findOneAndUpdate(
      { userId, discountUsed: false },   // only update if not already used
      { $set: { discountUsed: true } },
      { new: true }
    );

    if (!profile) {
      return res.status(400).json({ error: "Discount already used or user not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("user/use-discount error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/discount-status/:userId
// Returns current discount eligibility for a user.
// Used by Checkout to decide whether to apply the 10% discount.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/discount-status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.json({ eligible: false, discountPercent: 0 });
    }

    res.json({
      eligible: !profile.discountUsed,
      discountUsed: profile.discountUsed,
      discountPercent: profile.discountPercent,
    });
  } catch (err) {
    console.error("user/discount-status error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile/:userId
// Returns stored profile (including addresses) for a user
// ─────────────────────────────────────────────────────────────────────────────
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.json({});
    res.json(profile);
  } catch (err) {
    console.error("user/profile GET error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/user/profile/:userId
// Body: fields to merge into profile (name, phone, addresses, defaultAddressId)
// Creates profile if missing.
// ─────────────────────────────────────────────────────────────────────────────
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const update = {};
    const allowed = ["name", "phone", "addresses", "defaultAddressId"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true }
    );

    res.json(profile);
  } catch (err) {
    console.error("user/profile PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;