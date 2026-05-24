const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const validateRequest = require('../middleware/validateRequest');
const { updateWorkoutLogSchema } = require('../validation/requestSchemas');

/**
 * @route   GET /api/workouts
 * @desc    Get all workout logs for the authenticated user, keyed by date
 * @access  Private
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user.uid });
    
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
router.post('/', verifyFirebaseToken, validateRequest(updateWorkoutLogSchema), async (req, res) => {
  try {
    const { date, title, notes, exercises } = req.body;

    const logData = {
      title: title || '',
      notes: notes || '',
      exercises: exercises || []
    };

    const updatedLog = await WorkoutLog.findOneAndUpdate(
      { userId: req.user.uid, date },
      { $set: logData },
      { new: true, upsert: true }
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
router.delete('/:date', verifyFirebaseToken, async (req, res) => {
  try {
    const { date } = req.params;
    await WorkoutLog.findOneAndDelete({ userId: req.user.uid, date });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting workout log:', err);
    res.status(500).json({ error: 'Server error deleting workout log' });
  }
});

module.exports = router;
