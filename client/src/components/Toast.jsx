import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colors = {
    success: 'bg-stone-900 text-white',
    error:   'bg-red-600 text-white',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
                  flex items-center gap-2.5 px-4 py-2.5 rounded-full
                  shadow-xl text-sm font-medium ${colors[type]}`}
    >
      {type === 'success'
        ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      }
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white rounded-full px-1"
      >×</button>
    </div>
  );
}