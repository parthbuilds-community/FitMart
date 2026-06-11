const express = require("express");
const router = express.Router();
const FitnessCenter = require("../models/FitnessCenter");
const UserProfile = require("../models/UserProfile");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const admin = require("../firebaseAdmin");

const optionalFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  const token = authHeader.split('Bearer ')[1];
  try {
    if (process.env.NODE_ENV !== 'production' && token.startsWith('dev:')) {
      const email = token.slice(4);
      const uid = process.env.DEV_ADMIN_UID || `dev-admin-${(email || '').replace(/[^a-z0-9]/gi, '')}`;
      req.user = { uid, email, email_verified: true, name: 'Dev Admin' };
      return next();
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
  } catch (err) {}
  next();
};

// Simple helper to compute a mocked distance score and readable distance
function computeDistanceScore(userAddr, center) {
  // Lower score = closer
  let score = 100;
  let distanceKm = null;

  if (!userAddr) return { score, distanceKm };

  const uaCity = (userAddr.city || "").toLowerCase();
  const uaLine2 = (userAddr.line2 || userAddr.line1 || "").toLowerCase();
  const zip = (userAddr.zip || "").toLowerCase();

  const cCity = (center.city || "").toLowerCase();
  const cAddr = ((center.address || "") + " " + (center.city || "") + " " + (center.state || "")).toLowerCase();

  // City match strongly preferred
  if (uaCity && cCity && uaCity === cCity) {
    score -= 50;
  }

  // Locality keywords
  const localityWords = uaLine2.split(/[ ,\/\-]+/).filter(Boolean);
  let localityMatches = 0;
  localityWords.forEach(w => { if (w && cAddr.includes(w)) localityMatches++; });
  score -= localityMatches * 8;

  // Zip similarity
  if (zip && center.address && center.address.includes(zip)) score -= 10;

  // Use rating as a tiebreaker (higher rating slightly reduces score)
  const ratingAdj = (center.rating || 4) * 2;
  score -= ratingAdj;

  // Mock distanceKm based on score
  const approxKm = Math.max(0.3, Math.round((100 - Math.min(Math.max(score, 10), 100)) / 5) / 10 * 1); // rough mapping
  distanceKm = approxKm < 1 ? `${(approxKm * 1).toFixed(1)} km` : `${approxKm.toFixed(1)} km`;

  return { score, distanceKm };
}

// GET /api/fitness-centers/nearby?type=gym
router.get("/nearby", optionalFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    let userAddress = null;

    if (uid) {
      const user = await UserProfile.findOne({ userId: uid }).lean();
      if (user) {
        userAddress = (user.addresses || []).find(a => a.id === user.defaultAddressId) || (user.addresses || [])[0] || null;
      }
    }

    const typeFilter = req.query.type;
    const query = {};
    if (typeFilter && ["gym", "yoga", "pilates", "fitness_studio"].includes(typeFilter)) {
      query.type = typeFilter;
    }

    const centers = await FitnessCenter.find(query).lean();

    const scored = centers.map(c => {
      const { score, distanceKm } = computeDistanceScore(userAddress, c);
      return { ...c, distanceScore: score, distanceKm };
    });

    // Sort: distanceScore asc (lower better), then rating desc
    scored.sort((a, b) => {
      if (a.distanceScore !== b.distanceScore) return a.distanceScore - b.distanceScore;
      return (b.rating || 0) - (a.rating || 0);
    });

    const top = scored.slice(0, 10);
    return res.json(top);
  } catch (err) {
    console.error("/api/fitness-centers/nearby error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
