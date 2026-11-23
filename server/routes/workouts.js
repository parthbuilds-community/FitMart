const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');
const { requireAuth } = require('../middleware/requireAuth');
const validateRequest = require('../middleware/validateRequest');
const { updateWorkoutLogSchema } = require('../validation/requestSchemas');

function requireAuthUserId(req) {
  if (typeof req.user?.uid !== 'string' || req.user.uid.trim() === '') return null;
  return req.user.uid.trim();
}

function isValidDateKey(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
}

/**
 * @route   GET /api/workouts
 * @desc    Get all workout logs for the authenticated user, keyed by date
 * @access  Private
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = requireAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const logs = await WorkoutLog.find({ userId });
    
    // Format response to match the legacy localStorage format: { 'YYYY-MM-DD': { title, notes, exercises } }
    const formattedLogs = {};
    for (const log of logs) {
      formattedLogs[log.date] = {
        title: log.title,
        notes: log.notes,
        exercises: log.exercises
      };
    }
    
    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching workout logs:', err);
    res.status(500).json({ error: 'Server error fetching workout logs' });
  }
});

/**
 * @route   POST /api/workouts
 * @desc    Create or update a workout log for a specific date
 * @access  Private
 */
router.post('/', requireAuth, validateRequest(updateWorkoutLogSchema), async (req, res) => {
  try {
    const userId = requireAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { date, title, notes, exercises } = req.body;
    if (!isValidDateKey(date)) {
      return res.status(400).json({ error: 'Invalid workout date' });
    }

    const logData = {
      title: title || '',
      notes: notes || '',
      exercises: exercises || []
    };

    const updatedLog = await WorkoutLog.findOneAndUpdate(
      { userId, date },
      { $set: logData },
      { returnDocument: 'after', upsert: true }
    );

    res.json(updatedLog);
  } catch (err) {
    console.error('Error saving workout log:', err);
    res.status(500).json({ error: 'Server error saving workout log' });
  }
});

/**
 * @route   DELETE /api/workouts/:date
 * @desc    Delete a workout log for a specific date
 * @access  Private
 */
router.delete('/:date', requireAuth, async (req, res) => {
  try {
    const userId = requireAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { date } = req.params;
    if (!isValidDateKey(date)) {
      return res.status(400).json({ error: 'Invalid workout date' });
    }
    await WorkoutLog.findOneAndDelete({ userId, date });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting workout log:', err);
    res.status(500).json({ error: 'Server error deleting workout log' });
  }
});

module.exports = router;
