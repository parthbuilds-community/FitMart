const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');
const Membership = require('../models/Membership');
const Program = require('../models/Program');
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
 * @desc    Create or update a workout log for a specific date. When the caller
 *          has an active membership (or names a program with `programId`) the
 *          log is stamped with program context and the membership's
 *          `currentDayIndex` is advanced by one, capped at the program's
 *          `lengthDays`.
 * @access  Private
 */
router.post('/', verifyFirebaseToken, validateRequest(updateWorkoutLogSchema), async (req, res) => {
  const { date, title, notes, exercises, programId, dayIndex } = req.body;

  // Snapshot the previous state first so a failed membership update can be
  // rolled back below. Standalone MongoDB (including mongodb-memory-server) does
  // not support multi-document transactions, so we compensate manually rather
  // than opening a session — see #997.
  let previousLog;
  try {
    previousLog = await WorkoutLog.findOne({ userId: req.user.uid, date }).lean();
  } catch (err) {
    console.error('Error reading existing workout log:', err);
    return res.status(500).json({ error: 'Server error saving workout log' });
  }

  // Resolve the active membership. Best-effort read: the partial unique index
  // that guarantees a single active membership per program arrives with #992.
  const activeMembership = await Membership.findOne({
    userId: req.user.uid,
    status: 'active'
  }).catch(() => null);

  // A membership may only be advanced when the workout belongs to its program.
  // A caller-supplied `programId` is authoritative; without one we fall back to
  // the active membership's program.
  const membership =
    activeMembership && (!programId || String(activeMembership.planId) === String(programId))
      ? activeMembership
      : null;

  const program = membership
    ? await Program.findById(membership.planId).select('goal lengthDays').lean().catch(() => null)
    : null;

  // An explicit `programId` still labels the log even when there is no
  // membership to advance (for example logging against a program you are not
  // enrolled in).
  const logProgramId = programId || (membership ? String(membership.planId) : undefined);

  const totalDays =
    program && Number.isFinite(program.lengthDays) && program.lengthDays > 0
      ? program.lengthDays
      : null;

  // Duplicate prevention: re-logging the same date must not advance progress
  // twice. A log already stamped for this membership has been counted.
  const alreadyCounted =
    !!membership &&
    !!previousLog &&
    !!previousLog.membershipId &&
    String(previousLog.membershipId) === String(membership._id);

  // The program day this workout completes. A caller-supplied `dayIndex` wins;
  // otherwise it is the membership's current position, clamped into range.
  let resolvedDayIndex = dayIndex;
  if (resolvedDayIndex === undefined && membership) {
    const maxIndex = totalDays ? totalDays - 1 : 0;
    resolvedDayIndex = Math.max(0, Math.min(membership.currentDayIndex, maxIndex));
  }

  const logData = {
    title: title || '',
    notes: notes || '',
    exercises: exercises || []
  };
  if (logProgramId) logData.programId = logProgramId;
  if (resolvedDayIndex !== undefined) logData.dayIndex = resolvedDayIndex;
  if (membership) logData.membershipId = membership._id;

  let updatedLog;
  let updatedMembership = membership;
  let logWritten = false;

  try {
    updatedLog = await WorkoutLog.findOneAndUpdate(
      { userId: req.user.uid, date },
      { $set: logData },
      { returnDocument: 'after', upsert: true }
    );
    logWritten = true;

    // Advance progress by one, capped at completion. The aggregation-pipeline
    // update applies the cap atomically (no read-modify-write race).
    const shouldAdvance =
      !!membership &&
      totalDays !== null &&
      !alreadyCounted &&
      membership.currentDayIndex < totalDays;

    if (shouldAdvance) {
      updatedMembership = await Membership.findByIdAndUpdate(
        membership._id,
        [{ $set: { currentDayIndex: { $min: [{ $add: ['$currentDayIndex', 1] }, totalDays] } } }],
        // Aggregation-pipeline updates need an explicit opt-in in Mongoose 9.
        { new: true, updatePipeline: true }
      );
    }
  } catch (err) {
    console.error('Error saving workout log:', err);

    // Compensation: undo the log write so the caller can safely retry without
    // leaving a workout recorded that never advanced membership progress.
    if (logWritten) {
      try {
        if (previousLog) {
          await WorkoutLog.replaceOne({ _id: previousLog._id }, previousLog);
        } else {
          await WorkoutLog.deleteOne({ userId: req.user.uid, date });
        }
      } catch (rollbackErr) {
        console.error('Error rolling back workout log:', rollbackErr);
      }
    }

    return res.status(500).json({ error: 'Server error saving workout log' });
  }

  // The legacy log payload is returned unchanged for backward compatibility; the
  // optional `progress` block is appended only when a membership was in play.
  const payload = updatedLog.toObject();
  if (updatedMembership && totalDays !== null) {
    const currentDayIndex = updatedMembership.currentDayIndex;
    payload.progress = {
      currentDayIndex,
      totalDays,
      progressPercent: Math.round(Math.min(currentDayIndex / totalDays, 1) * 1000) / 10,
      programGoal: program.goal || ''
    };
  }

  res.json(payload);
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
