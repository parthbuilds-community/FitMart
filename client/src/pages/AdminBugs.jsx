import React, { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../auth/useAuth';
import { getBugs, patchBugStatus } from '../utils/api/bugs';
import { API_BASE } from '../lib/apiClient';
import Toast from '../components/Toast';
import BugScreenshot from '../components/BugScreenshot';



const SEGMENT_STYLES = {
  open: "bg-stone-900 text-white",
  "in-progress": "border border-stone-300 text-stone-600",
  resolved: "bg-stone-100 text-stone-600",
};

const BugAvatar = ({ title }) => (
  <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0
                   bg-stone-200 flex items-center justify-center`}>
    <span className="text-xs font-medium text-stone-600">
      {(title?.[0] || "!").toUpperCase()}
    </span>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-stone-100">
    {[55, 20, 15, 20, 15, 15, 15].map((w, i) => (
      <td key={i} className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="h-3 bg-stone-100 rounded-full animate-pulse"
          style={{ width: `${w}%`, margin: i > 0 ? "0 auto" : "0" }} />
      </td>
    ))}
  </tr>
);

const Empty = () => (
  <tr>
    <td colSpan={7} className="py-12 sm:py-16 text-center">
      <p className="text-3xl text-stone-200 mb-3">∅</p>
      <p className="text-sm text-stone-400 mb-1">No bug reports found</p>
      <p className="text-xs text-stone-300">Bug reports will appear here when users submit them</p>
    </td>
  </tr>
);

// Mobile bug card
const BugMobileCard = ({ bug, index, onClick, onStatusClick, isUpdating }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    onMouseDown={(e) => e.preventDefault()}
    aria-label={`View details for bug: ${bug.title}`}
    className="select-none flex items-start gap-3 py-3.5 border-b border-stone-100 last:border-0
               cursor-pointer active:bg-stone-50 transition-colors
               focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:ring-offset-white"
  >
    <span className="text-xs text-stone-300 w-5 shrink-0 text-center">{index + 1}</span>

    <BugAvatar title={bug.title} />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-sm font-medium text-stone-700 truncate">{bug.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onStatusClick && onStatusClick(bug); }}
          disabled={isUpdating}
          aria-label={`Change status for bug: ${bug.title}`}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0
                     focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-1
                     ${SEGMENT_STYLES[bug.status] || 'bg-stone-100 text-stone-600'}
                     ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {bug.status}
        </button>
      </div>
      <p className="text-xs text-stone-500 truncate">{bug.description}</p>
      {isUpdating && <p className="text-[10px] text-stone-400 mt-1 italic">Saving...</p>}
      <p className="text-[10px] text-stone-400 mt-1">{new Date(bug.createdAt).toLocaleString()}</p>
      <p className="text-[10px] text-stone-400 mt-1">{bug.reporterName || bug.reporterEmail || '—'}</p>
    </div>

    <div className="text-right shrink-0">
      <p className="text-[10px] text-stone-400">{bug.pageUrl ? 'Has URL' : 'No URL'}</p>
    </div>
  </div>
);

export default function AdminBugs() {
  const { user, loading } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingBugs, setLoadingBugs] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  // Mobile status picker state: { id, status }
  const [mobilePicker, setMobilePicker] = useState(null);

  const openMobilePicker = (bug) => {
    setMobilePicker({ id: bug._id, status: bug.status });
  };

  const closeMobilePicker = () => setMobilePicker(null);

  const handleMobileStatusChange = async (newStatus) => {
    if (!mobilePicker) return;
    const id = mobilePicker.id;
    const prev = bugs.find(b => b._id === id)?.status;
    
    // Add to updating set
    setUpdatingIds((cur) => new Set(cur).add(id));
    
    // optimistic update
    setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: newStatus } : b)));
    
    try {
      const token = await user.getIdToken();
      await patchBugStatus(id, newStatus, token);
      setToast({ message: 'Bug status updated successfully', type: 'success' });
      setMobilePicker(null);
    } catch (err) {
      console.error(err);
      // rollback
      setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: prev } : b)));
      setToast({ message: err.message || 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingIds((cur) => {
        const next = new Set(cur);
        next.delete(id);
        return next;
      });
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    let mounted = true;
    setLoadingBugs(true);
    (async () => {
      try {
        const token = await user.getIdToken();
        const bugsData = await getBugs(token);
        if (mounted) setBugs(bugsData);
      } catch (err) {
        console.error(err);
        setError('Unable to load bug reports');
      } finally {
        if (mounted) setLoadingBugs(false);
      }
    })();
    return () => { mounted = false; };
  }, [loading, user]);

  // Derived metrics for visualizations
  const statusCounts = bugs.reduce((acc, bug) => {
    acc[bug.status] = (acc[bug.status] || 0) + 1;
    return acc;
  }, {});

  // sort bugs: open -> in-progress -> resolved, then new -> old
  const order = { open: 0, 'in-progress': 1, resolved: 2 };
  const sortedBugs = [...bugs].sort((a, b) => {
    const oa = order[a.status] ?? 3;
    const ob = order[b.status] ?? 3;
    if (oa !== ob) return oa - ob;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`

      `}</style>

      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">

        {/* Page heading */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Admin</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900">
            Bug Reports
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-6 py-4 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">⚠ {error}</p>
            <p className="text-xs text-red-400 mt-1">Please try refreshing the page</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-10">
          {[
            { label: "Total Reports", value: bugs.length, icon: "◎" },
            { label: "Open", value: bugs.filter(b => b.status === "open").length, icon: "⭑" },
            { label: "Resolved", value: bugs.filter(b => b.status === "resolved").length, icon: "✓" },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                         hover:border-stone-300 hover:shadow-lg transition-all duration-300">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5">{label}</p>
              <div className="flex items-end justify-between">
                {loadingBugs ? (
                  <div className="h-8 sm:h-9 w-16 bg-stone-100 rounded-xl animate-pulse" />
                ) : (
                  <p style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-none">
                    {value}
                  </p>
                )}
                <span className="text-xl text-stone-200 mb-0.5">{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Insights — status distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 sm:mb-10">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">Insights</p>
            <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900 mb-4">Status distribution</h3>
            <div className="space-y-3">
              {['open', 'in-progress', 'resolved'].map(status => {
                const count = statusCounts[status] || 0;
                const pct = bugs.length ? Math.round((count / bugs.length) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status === 'open' ? 'bg-stone-900' : status === 'in-progress' ? 'bg-stone-100 border border-stone-300' : 'bg-stone-100'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-stone-600 capitalize">{status.replace('-', ' ')}</span>
                        <span className="text-xs text-stone-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-2 bg-stone-900" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">Recent</p>
            <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900 mb-4">Latest reports</h3>
            <div className="space-y-3">
              {bugs.length === 0 && <p className="text-xs text-stone-400">No reports yet</p>}
              {sortedBugs.slice(0, 5).map((bug, i) => (
                <div key={bug._id} className="flex items-center gap-3">
                  <span className="text-xs text-stone-300 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-stone-700 truncate">{bug.title}</span>
                      <span className="text-[10px] text-stone-400">{new Date(bug.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">{bug.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bug list card */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                        hover:border-stone-300 transition-all duration-300">
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100
                          flex justify-between items-center">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">Directory</p>
              <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">
                All Reports
              </h2>
            </div>
            {!loadingBugs && <p className="text-xs text-stone-400">{bugs.length} reports</p>}
          </div>

          {/* Mobile card list */}
          <div className="md:hidden px-4 py-2">
            {loadingBugs && (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse mb-3" />
              ))
            )}
            {!loadingBugs && bugs.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-3xl text-stone-200 mb-3">∅</p>
                <p className="text-sm text-stone-400 mb-1">No bug reports found</p>
                <p className="text-xs text-stone-300">Bug reports will appear here when users submit them</p>
              </div>
            )}
            {!loadingBugs && sortedBugs.map((bug, index) => (
              <BugMobileCard
                key={bug._id}
                bug={bug}
                index={index}
                onClick={() => { }} // Add navigation if you have a detail view
                onStatusClick={openMobilePicker}
                isUpdating={updatingIds.has(bug._id)}
              />
            ))}

            {mobilePicker && (
              <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-stone-200 p-4 md:hidden">
                <div className="max-w-2xl mx-auto">
                  <p className="text-xs text-stone-400 mb-2">Change status</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleMobileStatusChange('open')}
                      disabled={updatingIds.has(mobilePicker.id)}
                      aria-pressed={mobilePicker.status === 'open'}
                      aria-label="Set status to Open"
                      className={`flex-1 py-2 rounded-full text-sm
                                  focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2
                                  ${mobilePicker.status === 'open' ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-700'}
                                  ${updatingIds.has(mobilePicker.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Open
                    </button>
                    <button onClick={() => handleMobileStatusChange('in-progress')}
                      disabled={updatingIds.has(mobilePicker.id)}
                      aria-pressed={mobilePicker.status === 'in-progress'}
                      aria-label="Set status to In Progress"
                      className={`flex-1 py-2 rounded-full text-sm
                                  focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2
                                  ${mobilePicker.status === 'in-progress' ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-700'}
                                  ${updatingIds.has(mobilePicker.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      In Progress
                    </button>
                    <button onClick={() => handleMobileStatusChange('resolved')}
                      disabled={updatingIds.has(mobilePicker.id)}
                      aria-pressed={mobilePicker.status === 'resolved'}
                      aria-label="Set status to Resolved"
                      className={`flex-1 py-2 rounded-full text-sm
                                  focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2
                                  ${mobilePicker.status === 'resolved' ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-700'}
                                  ${updatingIds.has(mobilePicker.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Resolved
                    </button>
                  </div>
                  {updatingIds.has(mobilePicker.id) && (
                    <p className="text-xs text-stone-400 text-center mt-2 italic">Saving...</p>
                  )}
                  <div className="mt-3 text-center">
                    <button onClick={closeMobilePicker}
                      disabled={updatingIds.has(mobilePicker.id)}
                      className="text-xs text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 rounded px-2 py-1">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["#", "Title", "Description", "Status", "Reported", "Reporter", "Page", "Screenshot"].map((h, i) => (
                    <th key={h}
                      className={`px-6 py-4 text-xs tracking-[0.15em] uppercase text-stone-400
                                  font-normal whitespace-nowrap
                                  ${i === 0 || i === 1 || i === 2
                          ? "text-left"
                          : i === 4 ? "text-right" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {loadingBugs && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                {!loadingBugs && bugs.length === 0 && <Empty />}

                {!loadingBugs && sortedBugs.map((bug, index) => (
                  <tr key={bug._id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for bug: ${bug.title}`}
                    onClick={() => { }} // Add navigation if you have a detail view
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        // Add navigation if you have a detail view
                      }
                    }}
                    onMouseDown={(e) => {
                      // Allow interactive controls inside the row (select, input, button, textarea, a) to receive events.
                      const tag = (e.target && e.target.tagName || '').toLowerCase();
                      if (['select', 'option', 'input', 'button', 'a', 'textarea', 'svg', 'path'].includes(tag)) return;
                      e.preventDefault();
                    }}
                    className="select-none hover:bg-stone-50 transition-colors cursor-pointer group
                               focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stone-900">
                    <td className="px-6 py-5 text-stone-300 text-xs">{index + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <BugAvatar title={bug.title} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-stone-700
                                        group-hover:text-stone-900 truncate">
                            {bug.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-stone-500 line-clamp-2">{bug.description}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <select
                          value={bug.status}
                          disabled={updatingIds.has(bug._id)}
                          aria-label={`Change status for bug: ${bug.title}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const prev = bug.status;
                            const id = bug._id;
                            
                            // Add to updating set
                            setUpdatingIds((cur) => new Set(cur).add(id));
                            
                            // optimistic update
                            setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: newStatus } : b)));
                            
                            try {
                              const token = await user.getIdToken();
                              await patchBugStatus(id, newStatus, token);
                              setToast({ message: 'Bug status updated successfully', type: 'success' });
                            } catch (err) {
                              console.error(err);
                              // rollback
                              setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: prev } : b)));
                              setToast({ message: err.message || 'Failed to update status', type: 'error' });
                            } finally {
                              setUpdatingIds((cur) => {
                                const next = new Set(cur);
                                next.delete(id);
                                return next;
                              });
                            }
                          }}
                          className={`text-xs border border-stone-200 rounded-full px-3 py-1 bg-white
                                      focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2
                                      ${updatingIds.has(bug._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      {updatingIds.has(bug._id) && (
                        <p className="text-[10px] text-stone-400 text-center mt-1 italic">Saving...</p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right text-stone-400 text-xs whitespace-nowrap">
                      {new Date(bug.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-xs text-stone-600 mb-1">{bug.reporterName || '—'}</div>
                      <div className="text-xs text-stone-400">{bug.reporterEmail || '—'}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {bug.pageUrl ? (
                        <span className="text-xs text-stone-400 truncate max-w-37.5 block">
                          {bug.pageUrl.split('/').pop() || 'page'}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                        {(bug.screenshotUrl || bug.screenshot) ? (
                        (() => {
                          const url = bug.screenshotUrl ? bug.screenshotUrl : `${API_BASE}${bug.screenshot}`;
                          return (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-block"
                            >
                              <BugScreenshot src={url} title={bug.title} />
                            </a>
                          );
                        })()
                      ) : (
                        <BugScreenshot src={null} title={bug.title} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}