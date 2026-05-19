const express = require("express");
const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com";

/**
 * Maps UI category names to RapidAPI ExerciseDB body parts.
 * Some UI categories map to multiple API body parts.
 */
const CATEGORY_MAPPING = {
  chest: ["chest"],
  back: ["back"],
  shoulders: ["shoulders"],
  cardio: ["cardio"],
  abs: ["waist"],
  arms: ["upper arms", "lower arms"],
  legs: ["upper legs", "lower legs"],
};

/**
 * Fetches exercises from RapidAPI for a specific body part.
 */
async function fetchExercisesFromAPI(bodyPart) {
  const response = await fetch(
    `https://${RAPIDAPI_HOST}/exercises/bodyPart/${encodeURIComponent(bodyPart)}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`RapidAPI returned status ${response.status} for bodyPart: ${bodyPart}`);
  }

  return response.json();
}

/**
 * Normalizes an exercise object to ensure consistent media fields.
 * Inspects the raw API response and extracts available media.
 * 
 * RapidAPI ExerciseDB Response Fields (expected):
 * - gifUrl: Animation GIF URL (primary media - expected from /exercises/bodyPart endpoint)
 * - image: Fallback image URL (alternative field name)
 * - imageUrl: Alternative image field name
 * - videoUrl: Video URL if available
 * 
 * Note: If the API does not provide any media fields, the frontend will gracefully
 * show a placeholder (🏋️ icon) without breaking the UI. This is acceptable as the
 * exercise metadata (name, target, equipment) is still valuable for users.
 */
function normalizeExercise(ex, isFirstExercise = false) {
  // Log the raw API response structure on first exercise of each request
  // This helps diagnose if media fields are present in the API response
  if (isFirstExercise) {
    console.log("\n[ExerciseDB] Raw API Response - Available Fields:");
    console.log("  Keys:", Object.keys(ex).sort());
    if (process.env.NODE_ENV === 'development') {
      // Only log full object in development for debugging
      console.log("  Full Object:", JSON.stringify(ex, null, 2));
    }
    console.log("  gifUrl:", ex.gifUrl ? "✅ Present" : "❌ Missing");
    console.log("  image:", ex.image ? "✅ Present" : "❌ Missing");
    console.log("  imageUrl:", ex.imageUrl ? "✅ Present" : "❌ Missing");
    console.log("  videoUrl:", ex.videoUrl ? "✅ Present" : "❌ Missing");
    console.log("");
  }

  return {
    id: ex.id,
    name: ex.name || "",
    bodyPart: ex.bodyPart || "",
    target: ex.target || "",
    equipment: ex.equipment || "",
    // Try multiple possible field names for media URLs
    gifUrl: ex.gifUrl || ex.image || ex.imageUrl || null,
    imageUrl: ex.image || ex.imageUrl || null,
    videoUrl: ex.videoUrl || null,
  };
}

/**
 * Deduplicates exercises by ID.
 */
function deduplicateExercises(exercises) {
  const seen = new Set();
  return exercises.filter((ex) => {
    if (seen.has(ex.id)) return false;
    seen.add(ex.id);
    return true;
  });
}

/**
 * GET /api/exercises/:category
 * Fetches exercises for a specific UI category.
 * Handles category mapping and deduplication.
 * 
 * Supported categories:
 * - chest, back, arms, shoulders, legs, abs, cardio
 * 
 * Returns: Array of exercises with normalized media fields
 */
router.get("/:category", async (req, res) => {
  const { category } = req.params;

  // Validate input
  if (!CATEGORY_MAPPING[category.toLowerCase()]) {
    return res.status(400).json({
      error: `Invalid category. Supported: ${Object.keys(CATEGORY_MAPPING).join(", ")}`,
    });
  }

  // Check if API key is configured
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({
      error: "RapidAPI key not configured. Please set RAPIDAPI_KEY in .env",
    });
  }

  try {
    const bodyParts = CATEGORY_MAPPING[category.toLowerCase()];
    const allExercises = [];

    // Fetch exercises for all mapped body parts
    for (const bodyPart of bodyParts) {
      try {
        const exercises = await fetchExercisesFromAPI(bodyPart);
        allExercises.push(...exercises);
      } catch (error) {
        console.warn(
          `⚠️ Failed to fetch exercises for bodyPart "${bodyPart}": ${error.message}`
        );
        // Continue with other body parts even if one fails
      }
    }

    if (allExercises.length === 0) {
      console.warn(`No exercises found for category "${category}" (bodyParts: ${bodyParts.join(", ")})`);
      return res.json([]);
    }

    // Normalize all exercises (log first one to inspect raw API structure)
    const normalizedExercises = allExercises.map((ex, idx) => 
      normalizeExercise(ex, idx === 0)
    );

    // Deduplicate by ID
    const deduplicatedExercises = deduplicateExercises(normalizedExercises);

    // Log the normalized response for debugging
    if (deduplicatedExercises.length > 0) {
      const firstEx = deduplicatedExercises[0];
      console.log("\n[ExerciseDB] First Normalized Exercise (ready for client):");
      console.log("  Name:", firstEx.name);
      
      if (firstEx.gifUrl) {
        console.log("  gifUrl: ✅ Present");
        console.log("    Value:", firstEx.gifUrl.substring(0, 80) + (firstEx.gifUrl.length > 80 ? "..." : ""));
        console.log("    Starts with http:", firstEx.gifUrl.startsWith("http") ? "✅ Yes" : "❌ No");
      } else {
        console.log("  gifUrl: ❌ null/empty");
        console.log("    imageUrl fallback:", firstEx.imageUrl ? `Present: ${firstEx.imageUrl.substring(0, 60)}...` : "null");
      }
      
      console.log("  imageUrl:", firstEx.imageUrl ? `✅ Present` : "❌ null");
      console.log("  videoUrl:", firstEx.videoUrl ? `✅ Present` : "❌ null");
      console.log("");
    }

    console.log(
      `✅ Fetched ${deduplicatedExercises.length} unique exercises for category "${category}"`
    );
    res.json(deduplicatedExercises);
  } catch (error) {
    console.error(`❌ Error fetching exercises for category "${category}":`, error);
    res.status(500).json({
      error: "Failed to fetch exercises. Please try again later.",
    });
  }
});

module.exports = router;
