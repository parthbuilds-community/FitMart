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

/* ───────────────────────── Avatar ───────────────────────── */
const CustomerAvatar = ({ name, photoURL, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-stone-200 flex items-center justify-center`}>
    {photoURL ? (
      <img
        src={photoURL}
        alt={name || "avatar"}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    ) : (
      <span className="text-xs font-medium text-stone-600">
        {(name?.[0] || "?").toUpperCase()}
      </span>
    )}
  </div>
);

/* ───────────────────────── Skeleton ───────────────────────── */
const SkeletonRow = () => (
  <tr className="border-b border-stone-100 animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className="h-3 bg-stone-100 rounded w-full max-w-[80%] mx-auto" />
      </td>
    ))}
  </tr>
);

/* ───────────────────────── Empty ───────────────────────── */
const EmptyState = () => (
  <div className="py-16 text-center">
    <p className="text-3xl text-stone-200 mb-3">∅</p>
    <p className="text-sm text-stone-400">No customers found</p>
    <p className="text-xs text-stone-300">
      Customers appear once a paid order exists
    </p>
  </div>
);

/* ───────────────────────── Mobile Card ───────────────────────── */
const CustomerMobileCard = ({
  c,
  index,
  onClick,
  onSendReminder,
  isSending,
  reminderSent,
  reminderError,
}) => (
  <div className="border-b border-stone-100 last:border-0">
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center gap-3 py-3.5 cursor-pointer active:bg-stone-50"
    >
      <span className="text-xs text-stone-300 w-5 text-center">
        {index + 1}
      </span>

      <CustomerAvatar name={c.customerName} photoURL={c.customerPhoto} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate">
          {c.customerName || c.userId?.slice(0, 12)}
        </p>
        <p className="text-xs text-stone-400 truncate">{c.customerEmail}</p>
      </div>

      <div className="text-right">
        <p className="text-base text-stone-900">{fmt(c.totalSpend)}</p>
        <p className="text-[10px] text-stone-400">
          {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>

    <div className="px-4 py-2 bg-stone-50">
      {reminderSent[c.userId] ? (
        <span className="text-xs text-stone-400">✓ Sent</span>
      ) : reminderError[c.userId] ? (
        <p className="text-xs text-red-600">{reminderError[c.userId]}</p>
      ) : (
        <button
          onClick={(e) => onSendReminder(e, c.userId)}
          disabled={!c.eligibleForReminder || isSending === c.userId}
          className={`w-full text-xs py-1.5 rounded-lg ${
            c.eligibleForReminder
              ? "bg-stone-900 text-white"
              : "bg-stone-200 text-stone-400"
          }`}
        >
          {isSending === c.userId ? "Sending..." : "Send Reminder"}
        </button>
      )}
    </div>
  </div>
);

/* ───────────────────────── Page ───────────────────────── */
export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sendingId, setSendingId] = useState(null);
  const [sent, setSent] = useState({});
  const [errMap, setErrMap] = useState({});

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  /* ── Fetch customers ── */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/customers`, {
          headers,
          signal: controller.signal,
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        setCustomers(json.data || []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  /* ── Send reminder ── */
  const handleSendReminder = async (e, id) => {
    e.stopPropagation();
    setSendingId(id);

    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`${API_BASE}/customers/${id}/send-reminder`, {
        method: "POST",
        headers,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSent((p) => ({ ...p, [id]: true }));

      setTimeout(() => {
        setSent((p) => ({ ...p, [id]: false }));
      }, 2500);
    } catch (e) {
      setErrMap((p) => ({ ...p, [id]: e.message }));
    } finally {
      setSendingId(null);
    }
  };

  const segmentCounts = customers.reduce((a, c) => {
    a[c.segment] = (a[c.segment] || 0) + 1;
    return a;
  }, {});

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <h1 className="text-4xl font-serif mb-8">Customers</h1>

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 mb-6 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {["Total", "High Value", "New"].map((label, i) => (
            <div key={label} className="bg-white p-5 rounded-xl border">
              <p className="text-xs uppercase text-stone-400">{label}</p>
              <p className="text-3xl font-serif">
                {loading ? "..." : Object.values(segmentCounts)[i] || customers.length}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">

          {/* Mobile */}
          <div className="md:hidden">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 animate-pulse" />
            ))}

            {!loading && customers.length === 0 && <EmptyState />}

            {!loading &&
              customers.map((c, i) => (
                <CustomerMobileCard
                  key={c.userId}
                  c={c}
                  index={i}
                  onClick={() => navigate(`/admin/customers/${c.userId}`)}
                  onSendReminder={handleSendReminder}
                  isSending={sendingId}
                  reminderSent={sent}
                  reminderError={errMap}
                />
              ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b bg-stone-50">
                  {["#", "Customer", "Email", "Orders", "Spend", "Segment", "Notify"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs uppercase text-stone-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

                {!loading && customers.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState />
                    </td>
                  </tr>
                )}

                {!loading &&
                  customers.map((c, i) => (
                    <tr
                      key={c.userId}
                      className="border-b hover:bg-stone-50 cursor-pointer"
                      onClick={() => navigate(`/admin/customers/${c.userId}`)}
                    >
                      <td className="px-6 py-5">{i + 1}</td>
                      <td className="px-6 py-5">{c.customerName}</td>
                      <td className="px-6 py-5">{c.customerEmail || "—"}</td>
                      <td className="px-6 py-5">{c.orderCount}</td>
                      <td className="px-6 py-5">{fmt(c.totalSpend)}</td>
                      <td className="px-6 py-5 capitalize">{c.segment}</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={(e) => handleSendReminder(e, c.userId)}
                          className="text-xs bg-stone-900 text-white px-3 py-1 rounded"
                        >
                          Send
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
