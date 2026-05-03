import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../auth/useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-1/2 -translate-x-1/2 bottom-5 sm:bottom-6 z-[70] w-[calc(100%-1.5rem)] sm:w-auto max-w-md bg-stone-900 text-white border border-stone-700 rounded-full px-5 py-3.5 text-sm shadow-xl"
      role="status"
      aria-live="polite"
    >
      <span className="mr-2">✓</span>
      {message}
    </motion.div>
  );
}

export default function ReportBugButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState('');

  const pageUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '';
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !loading;

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    setErrorMessage('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please add both a title and a short description before sending.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        steps,
        pageUrl,
        reporterName: user?.displayName || '',
        reporterEmail: user?.email || '',
      };

      const headers = { 'Content-Type': 'application/json' };
      // If user authenticated, include token so server can verify and prefer token values
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API}/api/bugs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      let responseBody = null;
      try {
        responseBody = await res.json();
      } catch {
        responseBody = null;
      }

      if (!res.ok) {
        throw new Error(responseBody?.error || 'Could not submit your report right now. Please try again in a moment.');
      }

      setTitle('');
      setDescription('');
      setSteps('');
      setOpen(false);
      setToast('Thanks! Your bug report has been submitted.');
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to send bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => { setErrorMessage(''); setOpen(true); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:bottom-4 bg-white border border-stone-200 rounded-full px-4 py-2.5 text-sm text-stone-700 shadow-lg hover:shadow-xl hover:bg-stone-50 transition-all"
        aria-label="Report a bug"
      >
        Report a Bug
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            <motion.button
              type="button"
              aria-label="Close bug report modal"
              className="absolute inset-0 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
            />

            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-white border border-stone-200 rounded-2xl p-5 md:p-6 w-full max-w-xl m-3 sm:m-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Feedback</p>
                  <h3 className="text-xl font-['DM_Serif_Display'] text-stone-900">Report a bug</h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={140}
                required
                className="w-full border border-stone-200 rounded-lg px-4 py-3 mb-4 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="Short summary of the issue"
              />

              <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">What happened</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                disabled={loading}
                required
                className="w-full border border-stone-200 rounded-lg px-4 py-3 mb-4 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors resize-y"
                placeholder="Describe the bug and what you expected instead"
              />

              <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">Steps to reproduce (optional)</label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={3}
                disabled={loading}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 mb-4 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors resize-y"
                placeholder="1. Go to... 2. Click... 3. Observe..."
              />

              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={closeModal}
                  className="border border-stone-300 text-stone-700 text-sm px-5 py-2.5 rounded-full hover:bg-stone-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-stone-900 text-white text-sm px-5 py-2.5 rounded-full hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send report'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </AnimatePresence>
    </>
  );
}
