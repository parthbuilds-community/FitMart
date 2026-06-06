const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../lib/cloudinary');
const Bug = require('../models/Bug');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const admin = require('../firebaseAdmin');

// ── Input sanitization helpers ────────────────────────────────────────────

/**
 * Strips HTML tags from a string to prevent stored XSS.
 * React escapes output by default, but sanitizing at the server level
 * ensures safety regardless of how the data is later consumed.
 */
const stripHtml = (str) =>
  String(str || '').replace(/<[^>]*>/g, '').trim();

/**
 * Truncates a string to a maximum length after stripping HTML.
 */
const sanitize = (str, maxLength = 500) =>
  stripHtml(str).slice(0, maxLength);

/** Validates a basic email format. */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Field length limits ───────────────────────────────────────────────────
const LIMITS = {
  title: 150,
  description: 2000,
  steps: 2000,
  pageUrl: 500,
  browser: 200,
  reporterName: 100,
  reporterEmail: 254, // RFC 5321 max email length
};

// Use memory storage so serverless environments (Vercel) work correctly
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ── POST /api/bugs — public, accepts optional screenshot ──────────────────
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const rawTitle       = req.body.title;
    const rawDescription = req.body.description;
    const rawSteps       = req.body.steps;
    const rawPageUrl     = req.body.pageUrl;
    const rawBrowser     = req.body.browser;
    let   rawName        = req.body.reporterName;
    let   rawEmail       = req.body.reporterEmail;

    // ── Required field validation ─────────────────────────────────────────
    if (!rawTitle || !rawDescription)
      return res.status(400).json({ error: 'Title and description are required' });

    // ── Email format validation ───────────────────────────────────────────
    if (rawEmail && !isValidEmail(rawEmail))
      return res.status(400).json({ error: 'Invalid email format' });

    // ── Sanitize and truncate all string inputs ───────────────────────────
    const title       = sanitize(rawTitle,       LIMITS.title);
    const description = sanitize(rawDescription, LIMITS.description);
    const steps       = sanitize(rawSteps,       LIMITS.steps);
    const pageUrl     = sanitize(rawPageUrl,     LIMITS.pageUrl);
    const browser     = sanitize(rawBrowser,     LIMITS.browser);
    let reporterName  = sanitize(rawName,        LIMITS.reporterName);
    let reporterEmail = rawEmail
      ? String(rawEmail).slice(0, LIMITS.reporterEmail)
      : '';

    // ── Prefer authenticated name/email from token if present ────────────
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        reporterName  = decoded.name || decoded.emailName || reporterName || decoded.uid;
        reporterEmail = decoded.email || reporterEmail || '';
      }
    } catch {
      // ignore token errors for public submissions
    }

    // ── Screenshot upload ─────────────────────────────────────────────────
    let screenshotUrl = '';
    let screenshotPublicId = '';
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'fitmart/bugs',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        screenshotUrl = result.secure_url || '';
        screenshotPublicId = result.public_id || '';
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload screenshot' });
      }
    }

    const bug = new Bug({
      title,
      description,
      steps,
      pageUrl,
      browser,
      reporterName,
      reporterEmail,
      screenshot: '',
      screenshotUrl,
      screenshotPublicId,
    });

    await bug.save();
    res.status(201).json({ ok: true, bug });
  } catch (err) {
    console.error('Error saving bug:', err);
    res.status(500).json({ error: 'Failed to submit bug' });
  }
});

// ── GET /api/bugs — admin only ────────────────────────────────────────────
router.get('/', verifyFirebaseToken, verifyAdmin, async (_req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 }).limit(500);
    res.json({ ok: true, bugs });
  } catch (err) {
    console.error('Error fetching bugs:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

// ── PATCH /api/bugs/:id — admin only ─────────────────────────────────────
router.patch('/:id', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
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