const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const admin = require('../firebaseAdmin');

const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';

// Public: submit a bug report
// If an Authorization Bearer token is provided, try to extract reporter name/email from token
router.post('/', async (req, res) => {
  try {
    const { title, description, steps, pageUrl, browser } = req.body;
    let { reporterName, reporterEmail } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

    // If token present, verify and prefer authenticated name/email
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        reporterName = decoded.name || decoded.emailName || reporterName || decoded.uid;
        reporterEmail = decoded.email || reporterEmail || '';
      }
    } catch (err) {
      // ignore token verification errors for public submissions
    }

    const bug = new Bug({ title, description, steps, pageUrl, browser, reporterName, reporterEmail });
    await bug.save();
    res.status(201).json({ ok: true, bug });
  } catch (err) {
    console.error('Error saving bug:', err);
    res.status(500).json({ error: 'Failed to submit bug' });
  }
});

// Admin: list bug reports (requires valid Firebase ID token)
// Admin: list bug reports (requires valid Firebase ID token)
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 }).limit(500);
    res.json({ ok: true, bugs });
  } catch (err) {
    console.error('Error fetching bugs:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

// Admin: update status of a bug (requires auth + admin UID)
router.patch('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user || (ADMIN_UID && req.user.uid !== ADMIN_UID)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['open', 'in-progress', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const bug = await Bug.findByIdAndUpdate(id, { status }, { new: true });
    if (!bug) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, bug });
  } catch (err) {
    console.error('Error updating bug:', err);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

module.exports = router;
