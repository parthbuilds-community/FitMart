const express = require("express");
const router = express.Router();
const FitnessCenter = require("../models/FitnessCenter");
const UserProfile = require("../models/UserProfile");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

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
router.get("/nearby", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserProfile.findOne({ userId: uid }).lean();
    if (!user) return res.status(404).json({ error: "User profile not found" });

    const userAddress = (user.addresses || []).find(a => a.id === user.defaultAddressId) || (user.addresses || [])[0] || null;

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
