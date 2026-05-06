const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Bug = require('../models/Bug');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const admin = require('../firebaseAdmin');

const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';

// ── Multer setup — store screenshots in /uploads/bugs/ ────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads', 'bugs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ── POST /api/bugs — public, accepts optional screenshot ──────────────────
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { title, description, steps, pageUrl, browser } = req.body;
    let { reporterName, reporterEmail } = req.body;

    if (!title || !description)
      return res.status(400).json({ error: 'Title and description are required' });

    // Prefer authenticated name/email from token if present
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        reporterName = decoded.name || decoded.emailName || reporterName || decoded.uid;
        reporterEmail = decoded.email || reporterEmail || '';
      }
    } catch {
      // ignore token errors for public submissions
    }

    const screenshotPath = req.file
      ? `/uploads/bugs/${req.file.filename}`
      : '';

    const bug = new Bug({
      title,
      description,
      steps,
      pageUrl,
      browser,
      reporterName,
      reporterEmail,
      screenshot: screenshotPath,
    });

    await bug.save();
    res.status(201).json({ ok: true, bug });
  } catch (err) {
    // Clean up uploaded file if DB save fails
    if (req.file) fs.unlink(req.file.path, () => { });
    console.error('Error saving bug:', err);
    res.status(500).json({ error: 'Failed to submit bug' });
  }
});

// ── GET /api/bugs — admin only ────────────────────────────────────────────
router.get('/', verifyFirebaseToken, async (_req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 }).limit(500);
    res.json({ ok: true, bugs });
  } catch (err) {
    console.error('Error fetching bugs:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

// ── PATCH /api/bugs/:id — admin only ─────────────────────────────────────
router.patch('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user || (ADMIN_UID && req.user.uid !== ADMIN_UID && req.user.uid !== SUPER_ADMIN_UID))
      return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    if (!['open', 'in-progress', 'resolved'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const bug = await Bug.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!bug) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, bug });
  } catch (err) {
    console.error('Error updating bug:', err);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

module.exports = router;
