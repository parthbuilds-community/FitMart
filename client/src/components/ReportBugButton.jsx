import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { id: 'bug',     label: 'Bug' },
  { id: 'payment', label: 'Payment' },
  { id: 'content', label: 'Wrong info' },
  { id: 'other',   label: 'Other' },
];

const SEVERITIES = [
  { id: 'blocking',   label: 'Blocking',   hint: "Can't use the app" },
  { id: 'minor',      label: 'Minor',      hint: 'Annoying but workable' },
  { id: 'suggestion', label: 'Suggestion', hint: 'Nice to have' },
];

const DESC_MAX   = 500;
const TITLE_MAX  = 80;
const IMG_MAX_MB = 2;

function getBrowserInfo() {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/'))                          return 'Edge';
  if (ua.includes('Chrome/'))                       return 'Chrome';
  if (ua.includes('Firefox/'))                      return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  return ua.slice(0, 60);
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ type, message, onDismiss }) {
  const isSuccess = type === 'success';

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-16 right-4 z-70 flex items-start gap-3 rounded-2xl border
        px-4 py-3.5 shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-xs
        ${isSuccess ? 'bg-white border-stone-200' : 'bg-red-50 border-red-100'}`}
      role="alert"
      aria-live="polite"
    >
      <span className={`mt-0.5 select-none font-medium ${isSuccess ? 'text-stone-900' : 'text-red-600'}`}>
        {isSuccess ? '✓' : '×'}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isSuccess ? 'text-stone-900' : 'text-red-600'}`}>
          {isSuccess ? 'Report received' : 'Could not send report'}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed ${isSuccess ? 'text-stone-500' : 'text-red-500'}`}>
          {message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className={`text-base leading-none mt-0.5 transition-colors
          ${isSuccess ? 'text-stone-300 hover:text-stone-600' : 'text-red-300 hover:text-red-600'}`}
      >
        ×
      </button>
    </motion.div>
  );
}

// ── Field error ────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.18 }}
          className="text-xs text-red-600"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ── Success overlay shown inside modal before it closes ────────────────────
function SuccessOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center
                 bg-white rounded-2xl gap-3 px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-white text-xl"
      >
        ✓
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="font-['DM_Serif_Display'] text-xl text-stone-900"
      >
        Thanks for the report
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-sm text-stone-500 leading-relaxed"
      >
        We'll look into it shortly.
      </motion.p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportBugButton() {
  const { user } = useAuth();

  const [open, setOpen]               = useState(false);
  const [category, setCategory]       = useState('bug');
  const [severity, setSeverity]       = useState('minor');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps]             = useState('');
  const [screenshot, setScreenshot]   = useState(null); // { file, preview }
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [errors, setErrors]           = useState({});
  const [imgError, setImgError]       = useState('');

  const fileInputRef = useRef(null);
  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

  const dismissToast = useCallback(() => setToast(null), []);

  const resetForm = () => {
    setCategory('bug');
    setSeverity('minor');
    setTitle('');
    setDescription('');
    setSteps('');
    setScreenshot(null);
    setErrors({});
    setImgError('');
    setSuccess(false);
  };

  const openModal  = () => { resetForm(); setOpen(true); };
  const closeModal = () => { if (loading) return; setOpen(false); };

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading]);

  // Handle screenshot pick
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgError('Only image files are supported.');
      return;
    }
    if (file.size > IMG_MAX_MB * 1024 * 1024) {
      setImgError(`Image must be under ${IMG_MAX_MB} MB.`);
      return;
    }
    setImgError('');
    const preview = URL.createObjectURL(file);
    setScreenshot({ file, preview });
  };

  const removeScreenshot = () => {
    if (screenshot?.preview) URL.revokeObjectURL(screenshot.preview);
    setScreenshot(null);
    setImgError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!title.trim())       e.title       = 'Give it a short title so we know where to look.';
    if (!description.trim()) e.description = 'Tell us what went wrong — even a sentence helps.';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const headers = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      let body;
      if (screenshot?.file) {
        // Send as multipart so the image travels alongside the fields
        const fd = new FormData();
        fd.append('title',         `[${category.toUpperCase()}][${severity}] ${title.trim()}`);
        fd.append('description',   description.trim());
        fd.append('steps',         steps.trim());
        fd.append('pageUrl',       pageUrl);
        fd.append('browser',       getBrowserInfo());
        fd.append('reporterName',  user?.displayName || '');
        fd.append('reporterEmail', user?.email || '');
        fd.append('screenshot',    screenshot.file);
        body = fd;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title:         `[${category.toUpperCase()}][${severity}] ${title.trim()}`,
          description:   description.trim(),
          steps:         steps.trim(),
          pageUrl,
          browser:       getBrowserInfo(),
          reporterName:  user?.displayName || '',
          reporterEmail: user?.email || '',
        });
      }

      const res = await fetch(`${API}/api/bugs`, { method: 'POST', headers, body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Server error. Please try again.');
      }

      // Show success overlay inside modal, then close after 1.8s
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setToast({ type: 'success', message: "We'll look into it shortly. Thanks for taking the time." });
      }, 1800);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder-stone-300
     focus:outline-none transition-colors disabled:opacity-50
     ${hasError
       ? 'border-red-300 bg-red-50 focus:border-red-400'
       : 'border-stone-200 bg-white focus:border-stone-900'}`;

  return (
    <>
      {/* ── Trigger ── */}
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed z-50 left-4 bottom-4 bg-white border border-stone-200 rounded-full
                   px-4 py-2 text-sm text-stone-700 shadow-lg hover:shadow-xl
                   hover:border-stone-300 transition-all"
        aria-label="Report a bug"
      >
        Report a Bug
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={closeModal}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-stone-200 rounded-2xl w-full max-w-lg
                         z-10 shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden"
              noValidate
              aria-label="Bug report form"
            >
              {/* Success overlay */}
              <AnimatePresence>
                {success && <SuccessOverlay />}
              </AnimatePresence>

              {/* ── Scrollable body ── */}
              <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">
                      Help us improve
                    </p>
                    <h3 className="font-['DM_Serif_Display'] text-xl text-stone-900">
                      Report an issue
                    </h3>
                  </div>
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    whileTap={{ scale: 0.88 }}
                    transition={{ duration: 0.1 }}
                    aria-label="Close"
                    className="text-stone-400 hover:text-stone-700 transition-colors
                               text-2xl leading-none mt-0.5 disabled:opacity-30"
                  >
                    ×
                  </motion.button>
                </div>

                {/* ── Category chips ── */}
                <div>
                  <p className="text-xs text-stone-500 mb-2 tracking-wide uppercase">
                    What kind of issue?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <motion.button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition-all
                          ${category === c.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                      >
                        {c.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* ── Severity ── */}
                <div>
                  <p className="text-xs text-stone-500 mb-2 tracking-wide uppercase">
                    How bad is it?
                  </p>
                  <div className="flex gap-2">
                    {SEVERITIES.map(s => (
                      <motion.button
                        key={s.id}
                        type="button"
                        onClick={() => setSeverity(s.id)}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        title={s.hint}
                        className={`flex-1 text-xs py-2 px-1 rounded-lg border transition-all
                          ${severity === s.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                      >
                        {s.label}
                        <span className={`block text-[10px] mt-0.5
                          ${severity === s.id ? 'text-stone-300' : 'text-stone-400'}`}>
                          {s.hint}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* ── Title ── */}
                <div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-xs text-stone-500 tracking-wide uppercase">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] ${title.length > TITLE_MAX * 0.9 ? 'text-red-400' : 'text-stone-300'}`}>
                      {title.length}/{TITLE_MAX}
                    </span>
                  </div>
                  <input
                    value={title}
                    onChange={e => { setTitle(e.target.value.slice(0, TITLE_MAX)); setErrors(p => ({ ...p, title: '' })); }}
                    placeholder="e.g. Add to cart button does nothing"
                    disabled={loading}
                    className={inputBase(errors.title)}
                  />
                  <FieldError msg={errors.title} />
                </div>

                {/* ── What went wrong ── */}
                <div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-xs text-stone-500 tracking-wide uppercase">
                      What went wrong <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] ${description.length > DESC_MAX * 0.9 ? 'text-red-400' : 'text-stone-300'}`}>
                      {description.length}/{DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={e => { setDescription(e.target.value.slice(0, DESC_MAX)); setErrors(p => ({ ...p, description: '' })); }}
                    rows={3}
                    placeholder="Describe what you saw — even a quick sentence helps."
                    disabled={loading}
                    className={`${inputBase(errors.description)} resize-none`}
                  />
                  <FieldError msg={errors.description} />
                </div>

                {/* ── How to recreate ── */}
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 tracking-wide uppercase flex items-center gap-1.5">
                    How to recreate it
                    <span className="text-stone-400 normal-case tracking-normal text-[10px]">— optional</span>
                  </label>
                  <textarea
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    rows={2}
                    placeholder="1. Go to…  2. Tap…  3. See error"
                    disabled={loading}
                    className={`${inputBase(false)} resize-none`}
                  />
                </div>

                {/* ── Screenshot ── */}
                <div>
                  <p className="text-xs text-stone-500 mb-2 tracking-wide uppercase flex items-center gap-1.5">
                    Screenshot
                    <span className="text-stone-400 normal-case tracking-normal text-[10px]">— optional, max {IMG_MAX_MB} MB</span>
                  </p>

                  {screenshot ? (
                    <div className="relative rounded-lg overflow-hidden border border-stone-200 group">
                      <img
                        src={screenshot.preview}
                        alt="Screenshot preview"
                        className="w-full max-h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-2 right-2 bg-stone-900/70 text-white
                                   rounded-full w-6 h-6 flex items-center justify-center
                                   text-xs hover:bg-stone-900 transition-colors"
                        aria-label="Remove screenshot"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.1 }}
                      disabled={loading}
                      className="w-full border border-dashed border-stone-200 rounded-lg py-4
                                 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-600
                                 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="text-base leading-none">↑</span>
                      Attach a screenshot
                    </motion.button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                    aria-label="Upload screenshot"
                  />
                  <FieldError msg={imgError} />
                </div>

              </div>

              {/* ── Sticky footer ── */}
              <div className="px-5 sm:px-6 py-4 border-t border-stone-100
                              flex items-center justify-between gap-3 shrink-0">
                <div />
                <div className="flex items-center gap-2 ml-auto">
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className="text-xs border border-stone-200 text-stone-600 px-4 py-2
                               rounded-full hover:bg-stone-100 transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading || success}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className="bg-stone-900 text-white text-xs px-5 py-2 rounded-full
                               hover:bg-stone-700 transition-colors disabled:opacity-60
                               flex items-center gap-2 min-w-24 justify-center"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-3 h-3 border border-white/30 border-t-white rounded-full"
                        />
                        Sending…
                      </>
                    ) : (
                      'Send report'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.type + toast.message}
            type={toast.type}
            message={toast.message}
            onDismiss={dismissToast}
          />
        )}
      </AnimatePresence>
    </>
  );
}
