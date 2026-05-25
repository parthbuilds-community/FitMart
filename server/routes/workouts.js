const express = require("express");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const {
  deleteWorkoutLog,
  getWorkoutLogsByUser,
  upsertWorkoutLog,
} = require("../services/workoutService");

const router = express.Router();

/**
 * @route   GET /api/workouts
 * @desc    Get all workout logs for the authenticated user, keyed by date.
 * @access  Private
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const logs = await getWorkoutLogsByUser(req.user.uid);
    res.json(logs);
  } catch (err) {
    console.error("Error fetching workout logs:", err);
    res.status(500).json({ error: "Server error fetching workout logs" });
  }
});

/**
 * @route   POST /api/workouts
 * @desc    Create or update a workout log for a specific date.
 * @access  Private
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const updatedLog = await upsertWorkoutLog(req.user.uid, req.body);
    return res.json(updatedLog);
  } catch (err) {
    console.error("Error saving workout log:", err);
    return res.status(500).json({ error: "Server error saving workout log" });
  }
});

/**
 * @route   DELETE /api/workouts/:date
 * @desc    Delete a workout log for a specific date.
 * @access  Private
 */
router.delete("/:date", verifyFirebaseToken, async (req, res) => {
  try {
    await deleteWorkoutLog(req.user.uid, req.params.date);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting workout log:", err);
    res.status(500).json({ error: "Server error deleting workout log" });
  }
});

module.exports = router;
