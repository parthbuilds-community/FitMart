// server/routes/user.js
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../lib/cloudinary");
const UserProfile = require("../models/UserProfile");
const admin = require("../firebaseAdmin");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const { fail } = require("../utils/apiResponse");
const router = express.Router();

// Use memory storage for serverless environments
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for profile photos
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Ownership + admin checks
// A user may act on their own profile; admins may also read/write other users'
// profiles (e.g. the admin customer-detail page). Mirrors verifyAdmin.js.
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || '';
const isDev = process.env.NODE_ENV !== 'production';

function isAdminUser(req) {
  if (ADMIN_UID && req.user.uid === ADMIN_UID) return true;
  if (SUPER_ADMIN_UID && req.user.uid === SUPER_ADMIN_UID) return true;
  if (isDev) {
    if (DEV_ADMIN_EMAIL && req.user.email && req.user.email === DEV_ADMIN_EMAIL) return true;
    if (process.env.DEV_ADMIN_UID && req.user.uid === process.env.DEV_ADMIN_UID) return true;
  }
  return false;
}

// Reject unless the authenticated uid matches the userId in the request body.
function checkBodyOwnership(req, res) {
  if (req.user.uid === req.body.userId || isAdminUser(req)) return true;
  fail(res, 'Forbidden — you can only access your own profile', 403);
  return false;
}

// Reject unless the authenticated uid matches the userId in the route params.
function checkParamOwnership(req, res) {
  if (req.user.uid === req.params.userId || isAdminUser(req)) return true;
  fail(res, 'Forbidden — you can only access your own profile', 403);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/login
// Body: { userId }
// Called once after Firebase auth resolves.
// - If profile doesn't exist → create it (isFirstLogin: true) → return showBanner: true
// - If profile exists and isFirstLogin is true → flip it false → return showBanner: true
// - If profile exists and isFirstLogin is false → return showBanner: false
// Also syncs user email from Firebase to the profile for email sending.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return fail(res, "userId required");
    if (!checkBodyOwnership(req, res)) return;

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
        { returnDocument: 'after' }
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
    fail(res, err.message, 500);
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/dismiss-banner
// Body: { userId }
// Called when user dismisses the welcome banner.
// Flips isFirstLogin → false so it never shows again.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/dismiss-banner", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return fail(res, "userId required");
    if (!checkBodyOwnership(req, res)) return;

    await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { isFirstLogin: false } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("user/dismiss-banner error:", err);
    fail(res, err.message, 500);
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/use-discount
// Body: { userId }
// Called after a successful first order.
// Flips discountUsed → true so it can't be used again.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/use-discount", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return fail(res, "userId required");
    if (!checkBodyOwnership(req, res)) return;

    const profile = await UserProfile.findOneAndUpdate(
      { userId, discountUsed: false },   // only update if not already used
      { $set: { discountUsed: true } },
      { returnDocument: 'after' }
    );

    if (!profile) {
      return fail(res, "Discount already used or user not found");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("user/use-discount error:", err);
    fail(res, err.message, 500);
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/discount-status/:userId
// Returns current discount eligibility for a user.
// Used by Checkout to decide whether to apply the 10% discount.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/discount-status/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    if (!checkParamOwnership(req, res)) return;
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
    fail(res, err.message, 500);
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile/:userId
// Returns stored profile (including addresses) for a user
// ─────────────────────────────────────────────────────────────────────────────
router.get("/profile/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    if (!checkParamOwnership(req, res)) return;
    const { userId } = req.params;
    if (!userId) return fail(res, "userId required");

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.json({});
    res.json(profile);
  } catch (err) {
    console.error("user/profile GET error:", err);
    fail(res, err.message, 500);
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/user/profile/:userId
// Body: fields to merge into profile (name, phone, addresses, defaultAddressId)
// Creates profile if missing.
// ─────────────────────────────────────────────────────────────────────────────
router.put("/profile/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    if (!checkParamOwnership(req, res)) return;
    const { userId } = req.params;
    if (!userId) return fail(res, "userId required");

    const phoneRegex = /^\+?[\d\s\-]{7,15}$/;
    if (req.body.phone && !phoneRegex.test(req.body.phone)) {
      return fail(res, "Invalid phone number format");
    }

    const update = {};
    const allowed = ["name", "phone", "addresses", "defaultAddressId", "photoURL"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, returnDocument: 'after' }
    );

    res.json(profile);
  } catch (err) {
    console.error("user/profile PUT error:", err);
    fail(res, err.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/upload-photo/:userId
// Authenticated endpoint to upload profile photo to Cloudinary
// Body: multipart form-data with 'photo' field
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upload-photo/:userId", verifyFirebaseToken, upload.single("photo"), async (req, res) => {
  try {
    if (!checkParamOwnership(req, res)) return;
    const { userId } = req.params;
    if (!userId) return fail(res, "userId required");

    if (!req.file || !req.file.buffer) {
      return fail(res, "Photo file is required");
    }

    // Upload to Cloudinary using stream
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "fitmart/profile_photos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      const photoURL = result.secure_url || "";

      // Update user profile with new photo URL
      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: { photoURL } },
        { upsert: true, returnDocument: 'after' }
      );

      res.json({ success: true, photoURL, profile });
    } catch (uploadErr) {
      console.error("Cloudinary upload failed:", uploadErr);
      return fail(res, "Failed to upload photo", 500);
    }
  } catch (err) {
    console.error("user/upload-photo error:", err);
    fail(res, err.message, 500);
  }
});

module.exports = router;