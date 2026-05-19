import React, { useEffect, useState, useCallback } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../auth/useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LIMIT = 20;

const SEGMENT_STYLES = {
  open: "bg-stone-900 text-white",
  "in-progress": "border border-stone-300 text-stone-600",
  resolved: "bg-stone-100 text-stone-600",
};

const BugAvatar = ({ title }) => (
  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-stone-200 flex items-center justify-center">
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
    <td colSpan={8} className="py-12 sm:py-16 text-center">
      <p className="text-3xl text-stone-200 mb-3">∅</p>
      <p className="text-sm text-stone-400 mb-1">No bug reports found</p>
      <p className="text-xs text-stone-300">Bug reports will appear here when users submit them</p>
    </td>
  </tr>
);

const BugMobileCard = ({ bug, index, onClick, onStatusClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    onMouseDown={(e) => e.preventDefault()}
    className="select-none flex items-start gap-3 py-3.5 border-b border-stone-100 last:border-0 cursor-pointer active:bg-stone-50 transition-colors"
  >
    <span className="text-xs text-stone-300 w-5 shrink-0 text-center">{index + 1}</span>
    <BugAvatar title={bug.title} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-sm font-medium text-stone-700 truncate">{bug.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onStatusClick && onStatusClick(bug); }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0 focus:outline-none
                     ${SEGMENT_STYLES[bug.status] || 'bg-stone-100 text-stone-600'}`}
        >
          {bug.status}
        </button>
      </div>
      <p className="text-xs text-stone-500 truncate">{bug.description}</p>
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
  const [mobilePicker, setMobilePicker] = useState(null);

  // ── New filter / pagination state ──────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({});

  const totalPages = Math.ceil(total / LIMIT);

  const openMobilePicker = (bug) => setMobilePicker({ id: bug._id, status: bug.status });
  const closeMobilePicker = () => setMobilePicker(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page when filter changes
  const handleStatusFilter = (s) => { setStatusFilter(s); setPage(1); };

  // ── Fetch bugs ──────────────────────────────────────────────────────────
  const fetchBugs = useCallback(async () => {
    if (loading || !user) return;
    setLoadingBugs(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`${API}/api/bugs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const body = await res.json();
      setBugs(body.bugs || []);
      setTotal(body.total || 0);
      setSummary(body.summary || {});
    } catch (err) {
      console.error(err);
      setError('Unable to load bug reports');
    } finally {
      setLoadingBugs(false);
    }
  }, [loading, user, page, statusFilter, search]);

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const handleMobileStatusChange = async (newStatus) => {
    if (!mobilePicker) return;
    const id = mobilePicker.id;
    const prev = bugs.find(b => b._id === id)?.status;
    setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: newStatus } : b)));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API}/api/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`update failed (${res.status})`);
      setMobilePicker(null);
    } catch (err) {
      console.error(err);
      setBugs((cur) => cur.map(b => (b._id === id ? { ...b, status: prev } : b)));
      alert('Failed to update status');
    }
  };

  const order = { open: 0, 'in-progress': 1, resolved: 2 };
  const sortedBugs = [...bugs].sort((a, b) => {
    const oa = order[a.status] ?? 3, ob = order[b.status] ?? 3;
    if (oa !== ob) return oa - ob;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');`}</style>

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

        {/* ── Status Summary Bar ─────────────────────────────────────────── */}
        {!loadingBugs && (
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 text-sm text-stone-500">
            <span>
              <span className="font-semibold text-stone-900">{summary.open ?? 0}</span> open
            </span>
            <span className="text-stone-300">·</span>
            <span>
              <span className="font-semibold text-stone-900">{summary['in-progress'] ?? 0}</span> in progress
            </span>
            <span className="text-stone-300">·</span>
            <span>
              <span className="font-semibold text-stone-900">{summary.resolved ?? 0}</span> resolved
            </span>
            <span className="text-stone-300">·</span>
            <span>
              <span className="font-semibold text-stone-900">{total}</span> total
            </span>
          </div>
        )}

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
            { label: "Total Reports", value: total, icon: "◎" },
            { label: "Open", value: summary.open ?? 0, icon: "⭑" },
            { label: "Resolved", value: summary.resolved ?? 0, icon: "✓" },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
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

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 sm:mb-10">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">Insights</p>
            <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900 mb-4">Status distribution</h3>
            <div className="space-y-3">
              {['open', 'in-progress', 'resolved'].map(status => {
                const count = summary[status] || 0;
                const totalAll = (summary.open || 0) + (summary['in-progress'] || 0) + (summary.resolved || 0);
                const pct = totalAll ? Math.round((count / totalAll) * 100) : 0;
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
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-all duration-300">
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100">

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">Directory</p>
                <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">All Reports</h2>
              </div>
              {!loadingBugs && <p className="text-xs text-stone-400">{total} reports</p>}
            </div>

            {/* ── Search Input ─────────────────────────────────────────── */}
            <input
              type="text"
              placeholder="Search by title, reporter, or URL…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full mb-4 px-4 py-2 text-sm border border-stone-200 rounded-full
                         text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400
                         transition-colors"
            />

            {/* ── Status Filter Pills ──────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
              {['all', 'open', 'in-progress', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                    ${statusFilter === s
                      ? 'bg-stone-900 text-white'
                      : 'border border-stone-200 text-stone-500 hover:border-stone-400'
                    }`}
                >
                  {s === 'all'
                    ? `All (${total})`
                    : `${s.replace('-', ' ')} (${summary[s] ?? 0})`}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden px-4 py-2">
            {loadingBugs && [...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse mb-3" />
            ))}
            {!loadingBugs && bugs.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-3xl text-stone-200 mb-3">∅</p>
                <p className="text-sm text-stone-400 mb-1">No bug reports found</p>
                <p className="text-xs text-stone-300">Try adjusting your search or filter</p>
              </div>
            )}
            {!loadingBugs && sortedBugs.map((bug, index) => (
              <BugMobileCard key={bug._id} bug={bug} index={index} onClick={() => {}} onStatusClick={openMobilePicker} />
            ))}

            {mobilePicker && (
              <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-stone-200 p-4 md:hidden">
                <div className="max-w-2xl mx-auto">
                  <p className="text-xs text-stone-400 mb-2">Change status</p>
                  <div className="flex gap-2">
                    {['open', 'in-progress', 'resolved'].map(s => (
                      <button key={s} onClick={() => handleMobileStatusChange(s)}
                        className={`flex-1 py-2 rounded-full text-sm capitalize ${mobilePicker.status === s ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-700'}`}>
                        {s.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <button onClick={closeMobilePicker} className="text-xs text-stone-500">Cancel</button>
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
                      className={`px-6 py-4 text-xs tracking-[0.15em] uppercase text-stone-400 font-normal whitespace-nowrap
                                  ${i === 0 || i === 1 || i === 2 ? "text-left" : i === 4 ? "text-right" : "text-center"}`}>
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
                    role="button" tabIndex={0}
                    onClick={() => {}}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.preventDefault(); }}
                    onMouseDown={(e) => {
                      const tag = (e.target?.tagName || '').toLowerCase();
                      if (['select', 'option', 'input', 'button', 'a', 'textarea', 'svg', 'path'].includes(tag)) return;
                      e.preventDefault();
                    }}
                    className="select-none hover:bg-stone-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-5 text-stone-300 text-xs">{(page - 1) * LIMIT + index + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <BugAvatar title={bug.title} />
                        <p className="text-xs font-medium text-stone-700 group-hover:text-stone-900 truncate">{bug.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-stone-500 line-clamp-2">{bug.description}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <select
                          value={bug.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const prev = bug.status;
                            setBugs((cur) => cur.map(b => (b._id === bug._id ? { ...b, status: newStatus } : b)));
                            try {
                              const token = await user.getIdToken();
                              const res = await fetch(`${API}/api/bugs/${bug._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              if (!res.ok) throw new Error(`update failed (${res.status})`);
                            } catch (err) {
                              console.error(err);
                              setBugs((cur) => cur.map(b => (b._id === bug._id ? { ...b, status: prev } : b)));
                              alert('Failed to update status');
                            }
                          }}
                          className="text-xs border border-stone-200 rounded-full px-3 py-1 bg-white"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right text-stone-400 text-xs whitespace-nowrap">
                      {new Date(bug.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-xs text-stone-600 mb-1">{bug.reporterName || '—'}</div>
                      <div className="text-xs text-stone-400">{bug.reporterEmail || '—'}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {bug.pageUrl
                        ? <span className="text-xs text-stone-400 truncate max-w-37.5 block">{bug.pageUrl.split('/').pop() || 'page'}</span>
                        : <span className="text-xs text-stone-300">—</span>}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {(bug.screenshotUrl || bug.screenshot) ? (() => {
                        const url = bug.screenshotUrl ? bug.screenshotUrl : `${API}${bug.screenshot}`;
                        return (
                          <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-block">
                            <img src={url} alt="Screenshot" className="w-12 h-8 object-cover rounded border border-stone-200 hover:opacity-80 transition-opacity" />
                          </a>
                        );
                      })() : <span className="text-xs text-stone-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Controls ──────────────────────────────────────── */}
          {!loadingBugs && totalPages > 1 && (
            <div className="px-4 sm:px-7 py-4 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 text-xs border border-stone-200 rounded-full text-stone-500
                           hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <span className="text-xs text-stone-400">
                Page <span className="text-stone-700 font-medium">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 text-xs border border-stone-200 rounded-full text-stone-500
                           hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}