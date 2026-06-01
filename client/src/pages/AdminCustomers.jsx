// src/pages/AdminCustomers.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../utils/formatters";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const SEGMENT_STYLES = {
  "high-value": "bg-stone-900 text-white",
  returning: "border border-stone-300 text-stone-600",
  new: "bg-stone-100 text-stone-600",
};

// ── Shared UI Components ──────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
  <div className={`bg-stone-100 rounded-2xl animate-pulse ${className}`} />
);

const CustomerAvatar = ({ name, photoURL, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0
                   bg-stone-200 flex items-center justify-center`}>
    {photoURL ? (
      <img src={photoURL} alt={name || "User profile"}
        className="w-full h-full object-cover" referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = "none"; }} />
    ) : (
      <span className="text-xs font-medium text-stone-600">
        {(name?.[0] || "?").toUpperCase()}
      </span>
    )}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-stone-100">
    {[55, 20, 15, 20, 15, 15].map((w, i) => (
      <td key={i} className="px-6 py-5">
        <Skeleton className="h-3 w-full max-w-[80px]" />
      </td>
    ))}
  </tr>
);

const Empty = () => (
  <tr>
    <td colSpan={8} className="py-12 sm:py-16 text-center">
      <p className="text-3xl text-stone-200 mb-3">∅</p>
      <p className="text-sm text-stone-400 mb-1">No customers found</p>
      <p className="text-xs text-stone-300">Customers appear once a paid order exists</p>
    </td>
  </tr>
);

// ── Mobile customer card ──────────────────────────────────────────────────
const CustomerMobileCard = ({ c, index, onClick, onSendReminder, isSending, reminderSent, reminderError }) => (
  <div className="border-b border-stone-100 last:border-0">
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="flex items-center gap-3 py-4 cursor-pointer active:bg-stone-50 transition-colors"
    >
      <span className="text-xs text-stone-300 w-5 shrink-0 text-center">{index + 1}</span>
      <CustomerAvatar name={c.customerName} photoURL={c.customerPhoto} size={8} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-stone-700 truncate">
            {c.customerName && c.customerName !== "—" ? c.customerName : c.userId?.slice(0, 12) + "…"}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0 ${SEGMENT_STYLES[c.segment]}`}>
            {c.segment}
          </span>
        </div>
        {c.customerEmail && c.customerEmail !== "—" && (
          <p className="text-xs text-stone-400 truncate">{c.customerEmail}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-base text-stone-900">
          {fmt(c.totalSpend)}
        </p>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [reminderSent, setReminderSent] = useState({});
  const [reminderError, setReminderError] = useState({});
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/customers`, { headers });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load customers");
        setCustomers(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSendReminder = async (e, customerId) => {
    e.stopPropagation();
    setSendingReminderId(customerId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/customers/${customerId}/send-reminder`, {
        method: "POST", headers, credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send");
      setReminderSent(prev => ({ ...prev, [customerId]: true }));
      setTimeout(() => setReminderSent(prev => ({ ...prev, [customerId]: false })), 3000);
    } catch (err) {
      setReminderError(prev => ({ ...prev, [customerId]: err.message }));
    } finally {
      setSendingReminderId(null);
    }
  };

  const segmentCounts = customers.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});
  const topBySpend = [...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
      `}</style>

      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Management</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl md:text-5xl text-stone-900">
            Customers
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-6 py-4 mb-6 sm:mb-8 text-sm text-red-600">
            ⚠ {error} — Please refresh.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-8">
          {["Total Customers", "High Value", "New Customers"].map((label, i) => (
            <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">{label}</p>
              {loading ? <Skeleton className="h-10 w-20" /> : (
                <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-none">
                  {i === 0 ? customers.length : i === 1 ? customers.filter(c => c.segment === "high-value").length : customers.filter(c => c.segment === "new").length}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Insights Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">{i === 1 ? "Insights" : "Top Customers"}</p>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  {[1, 2, 3].map(j => <Skeleton key={j} className="h-10 w-full" />)}
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900 mb-4">
                    {i === 1 ? "Segment distribution" : "Top spenders"}
                  </h3>
                  {/* ... Existing Insights Content ... */}
                  <div className="space-y-3">
                    {(i === 1 ? ['high-value', 'returning', 'new'] : topBySpend).map(item => {
                       // Logic for rendering distribution or spenders (kept same as your original)
                       return <div key={item.userId || item} className="h-10 bg-stone-50 rounded-lg" /> // Simplified for this example, keep your original inside!
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Main List */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  {["#", "Customer", "Email", "Orders", "Total Spend", "Segment", "Last Order", "Notify"].map(h => (
                    <th key={h} className="px-6 py-4 text-xs tracking-[0.15em] uppercase text-stone-400 font-normal text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : customers.length === 0 ? <Empty /> : (
                  customers.map((c, index) => (
                    <tr key={c.userId} className="hover:bg-stone-50/80 transition-colors cursor-pointer group">
                      {/* ... Keep your existing Table Row Content ... */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}