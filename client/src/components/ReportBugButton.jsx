import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReportBugButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);
    try {
      const payload = {
        title,
        description,
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
      if (!res.ok) throw new Error('submit failed');
      setSent(true);
      setTitle(''); setDescription(''); setSteps('');
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      console.error(err);
      alert('Failed to send bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setSent(false); setOpen(true); }}
        className="fixed z-50 left-4 bottom-4 bg-white border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-700 shadow-lg hover:shadow-2xl hover:bg-stone-50 transition-all"
        aria-label="Report a bug"
      >
        Report a Bug
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <form
            onSubmit={submit}
            className="relative bg-white border border-stone-200 rounded-2xl p-5 md:p-6 w-full max-w-lg m-4 z-10"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-['DM_Serif_Display'] text-stone-900">Report a bug</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-stone-400">×</button>
            </div>

            {sent ? (
              <p className="text-sm text-stone-600">Thanks — your report has been submitted.</p>
            ) : (
              <>
                <label className="block text-xs text-stone-500 mb-1.5">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 mb-3 text-sm text-stone-900" />

                <label className="block text-xs text-stone-500 mb-1.5">What happened</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border border-stone-200 rounded-lg px-3 py-2 mb-3 text-sm text-stone-900" />

                <label className="block text-xs text-stone-500 mb-1.5">Steps to reproduce (optional)</label>
                <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={3} className="w-full border border-stone-200 rounded-lg px-3 py-2 mb-3 text-sm text-stone-900" />

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="bg-stone-900 text-white text-sm px-4 py-2 rounded-full">
                    {loading ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
