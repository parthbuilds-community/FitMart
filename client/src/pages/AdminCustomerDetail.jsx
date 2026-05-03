// src/pages/AdminCustomerDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { fmt } from "../utils/formatters";
import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const SEGMENT_STYLES = {
  "high-value": "bg-stone-900 text-white",
  returning: "border border-stone-300 text-stone-600",
  new: "bg-stone-100 text-stone-600",
};

const STATUS_STYLES = {
  paid: "bg-stone-900 text-white",
  created: "border border-stone-300 text-stone-600",
  failed: "bg-red-50 border border-red-100 text-red-600",
};

// ── Mirrors Navbar.jsx avatar pattern ─────────────────────────────────────
const CustomerAvatar = ({ name, photoURL, size = "16" }) => (
  <div className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0
                   bg-stone-200 flex items-center justify-center`}>
    {photoURL ? (
      <img
        src={photoURL}
        alt={name || "avatar"}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = "none"; }}
      />
    ) : (
      <span className="text-xl md:text-2xl font-medium text-stone-500">
        {(name?.[0] || "?").toUpperCase()}
      </span>
    )}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-stone-100">
    {[40, 10, 15, 20, 15].map((w, i) => (
      <td key={i} className="px-4 md:px-6 py-4 md:py-5">
        <div className="h-3 bg-stone-100 rounded-full animate-pulse"
          style={{ width: `${w}%`, margin: i > 0 ? "0 auto" : "0" }} />
      </td>
    ))}
  </tr>
);

// ── Mobile order card ──────────────────────────────────────────────────────
const MobileOrderCard = ({ order, expanded, onToggle, onDownload, productMap }) => (
  <div className="border border-stone-100 rounded-xl overflow-hidden mb-3">
    {/* Card header — tappable */}
    <button
      onClick={() => onToggle(order._id)}
      className="w-full text-left px-4 py-4 bg-white active:bg-stone-50
                 flex items-start justify-between gap-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono text-stone-400 truncate mb-1.5">
          {order._id}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
          <span className="text-xs text-stone-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p style={{ fontFamily: "'DM Serif Display', serif" }}
          className="text-lg text-stone-900 leading-none mb-1">
          {fmt(order.total)}
        </p>
        <p className="text-[10px] text-stone-400 whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </p>
      </div>

      <span className="text-stone-300 text-sm shrink-0 mt-0.5">
        {expanded ? "▾" : "▸"}
      </span>
    </button>

    {/* Expanded items */}
    {expanded && (
      <div className="border-t border-stone-100 bg-stone-50 divide-y divide-stone-100">
        {order.items.map((item, idx) => {
          const prod = productMap?.[item.productId] || {};
          const name = prod.name || `Product #${item.productId}`;
          const brand = prod.brand || "";
          return (
            <div key={`${order._id}-${idx}`} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-stone-500 truncate">{name}</p>
                {brand && <p className="text-[10px] text-stone-400 mt-0.5">{brand}</p>}
                <p className="text-[10px] text-stone-400 mt-0.5">₹{item.price} each</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-stone-400">×{item.quantity}</p>
                <p className="text-xs font-medium text-stone-600 mt-0.5">{fmt(item.price * item.quantity)}</p>
              </div>
            </div>
          );
        })}

        <div className="px-4 py-3">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(order); }}
            className="text-xs border border-stone-300 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            Download Invoice
          </button>
        </div>
      </div>
    )}
  </div>
);

export default function AdminCustomerDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [productMap, setProductMap] = useState({});
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderError, setReminderError] = useState(null);

  const toggleOrder = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    fetch(`${API_BASE}/customers/${userId}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error(json.error || "Failed to load customer");
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Customer detail fetch error:", err);
        setError(err.message || "Customer not found");
        setLoading(false);
      });
  }, [userId]);

  // Fetch product details for all products referenced in orders (watch `data` to avoid TDZ)
  useEffect(() => {
    const ordersList = data?.orders;
    if (!ordersList || ordersList.length === 0) return;
    const ids = [...new Set(ordersList.flatMap(o => o.items.map(i => i.productId)).filter(Boolean))];
    if (ids.length === 0) return;
    const map = {};
    Promise.all(ids.map(id =>
      fetch(`${API_BASE}/products/${id}`).then(r => r.ok ? r.json() : null)
        .then(p => { if (p) map[id] = p; })
        .catch(() => { })
    )).then(() => setProductMap(map));
  }, [data]);

  // Generate and open a simple invoice HTML for a given order
  const downloadInvoice = async (order) => {
    try {
      const customer = { name: customerName || userId, email: customerEmail || "" };
      // Try to fetch saved profile/address for the user to include in invoice
      let profileAddrHtml = "";
      try {
        const root = API_BASE.replace(/\/api$/, "");
        const res = await fetch(`${root}/api/user/profile/${userId}`, { credentials: 'include' });
        if (res.ok) {
          const p = await res.json();
          const addr = (p?.addresses || []).find(a => a.id === p?.defaultAddressId) || (p?.addresses || [])[0];
          if (addr) {
            profileAddrHtml = `<div style="margin-top:6px">${addr.label || ''}</div>` +
              `<div style="margin-top:4px">${addr.line1 || ''}${addr.line2 ? ', ' + addr.line2 : ''}</div>` +
              `<div style="margin-top:4px">${[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</div>` +
              `${addr.country ? `<div style="margin-top:4px">${addr.country}</div>` : ''}` +
              `${addr.phone ? `<div style="margin-top:4px">${addr.phone}</div>` : ''}`;
          }
        }
      } catch (e) {
        // ignore profile fetch errors — invoice will still work without address
      }
      const itemsHtml = order.items.map(({ productId, quantity, price }) => {
        const prod = productMap[productId] || {};
        const name = prod.name || `Product #${productId}`;
        const brand = prod.brand || "";
        return `
          <tr>
            <td>
              <div class="product-brand">${brand}</div>
              <div class="product-name">${name}</div>
              <div class="unit-price">${fmt(price)} / unit</div>
            </td>
            <td style="text-align:center">${quantity}</td>
            <td style="text-align:right">${fmt(price * quantity)}</td>
          </tr>`;
      }).join("");

      const invoiceHTML = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order._id}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#1c1917}
      .brand{font-weight:700;font-size:24px}.product-brand{font-size:10px;color:#78716c;text-transform:uppercase}
      .product-name{font-size:14px}.unit-price{font-size:11px;color:#a8a29e}
      table{width:100%;border-collapse:collapse;margin-top:20px}thead tr{background:#1c1917;color:#fff}thead th{padding:8px;text-align:left;font-size:10px}
      tbody td{padding:12px;border-bottom:1px solid #e7e5e3}
      .totals{margin-top:20px;width:280px;margin-left:auto}
      .total-row{display:flex;justify-content:space-between;padding:6px 0}
      </style></head><body>
      <div class="brand">FitMart</div>
      <div style="margin-top:8px;color:#78716c;font-size:12px">Tax Invoice · ${new Date(order.createdAt).toLocaleString()}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
        <div><h4 style="font-size:10px;color:#78716c;text-transform:uppercase">Billed To</h4><div style="margin-top:6px">${customer.name}</div>${customer.email ? `<div style="margin-top:4px">${customer.email}</div>` : ''}${profileAddrHtml ? `<div style="margin-top:8px">${profileAddrHtml}</div>` : ''}</div>
        <div><h4 style="font-size:10px;color:#78716c;text-transform:uppercase">Sold By</h4><div style="margin-top:6px">FitMart India Pvt. Ltd.</div><div>Mumbai</div></div>
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <div class="totals"><div class="total-row"><span>Subtotal</span><span>${fmt(order.total)}</span></div><div class="total-row grand" style="font-weight:700;margin-top:8px;border-top:1px solid #e7e5e3;padding-top:8px"><span>Total Paid</span><span>${fmt(order.total)}</span></div></div>
      </body></html>`;

      const win = window.open("", "_blank");
      win.document.write(invoiceHTML);
      win.document.close();
      win.focus();
    } catch (e) {
      console.error('Invoice error', e);
      alert('Failed to generate invoice');
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    setReminderError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/customers/${userId}/send-reminder`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) {
        setReminderError(resData.error || "Failed to send reminder");
        return;
      }
      setReminderSent(true);
      // Clear success message after 3 seconds
      setTimeout(() => setReminderSent(false), 3000);
    } catch (err) {
      setReminderError(err.message || "Error sending reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const {
    customerName, customerEmail, customerPhoto,
    orderCount, totalSpend, firstOrder, lastOrder,
    segment, orders, daysSinceLastOrder, eligibleForReminder, lastReminderEmailSentAt,
  } = data || {};

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
      `}</style>

      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 md:px-6 py-4 md:py-5 mb-6 md:mb-8">
            <p className="text-sm text-red-600">⚠ {error}</p>
          </div>
        )}

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div className="mb-8 md:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4 md:mb-5">
            Customer Profile
          </p>

          {loading ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-stone-100 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-6 md:h-7 w-40 md:w-48 bg-stone-100 rounded-full animate-pulse" />
                <div className="h-3 w-28 md:w-32 bg-stone-100 rounded-full animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-5">
              {/* Avatar — slightly smaller on mobile */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0
                              bg-stone-200 flex items-center justify-center">
                {customerPhoto ? (
                  <img
                    src={customerPhoto}
                    alt={customerName || "avatar"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-medium text-stone-500">
                    {(customerName?.[0] || "?").toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Name + segment badge */}
                <div className="flex items-start md:items-center gap-2 md:gap-3 flex-wrap mb-1">
                  <h1
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-tight wrap-break-word"
                  >
                    {customerName && customerName !== "—" ? customerName : userId}
                  </h1>
                  {segment && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shrink-0
                                      ${SEGMENT_STYLES[segment]}`}>
                      {segment}
                    </span>
                  )}
                </div>

                {/* Email — truncate on small screens */}
                {customerEmail && customerEmail !== "—" && (
                  <p className="text-sm text-stone-500 truncate">{customerEmail}</p>
                )}

                {/* UID */}
                <p className="text-[10px] text-stone-300 font-mono mt-1 truncate">{userId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reminder Email Section */}
        {!loading && (
          <div className="mb-8 md:mb-10 bg-white border border-stone-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase text-stone-400 mb-2 leading-tight">
                  Engagement
                </p>
                <p className="text-sm md:text-base text-stone-600 mb-4">
                  {eligibleForReminder
                    ? `Customer inactive for ${daysSinceLastOrder} days`
                    : `Last order ${daysSinceLastOrder} days ago (< 30 days inactive)`}
                </p>
                {lastReminderEmailSentAt && (
                  <p className="text-xs text-stone-400">
                    Last reminder: {new Date(lastReminderEmailSentAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div>
                {reminderSent ? (
                  <div className="px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-600 text-center">
                    ✓ Reminder sent
                  </div>
                ) : reminderError ? (
                  <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center max-w-xs">
                    {reminderError}
                  </div>
                ) : (
                  <button
                    onClick={handleSendReminder}
                    disabled={!eligibleForReminder || sendingReminder || loading}
                    title={!eligibleForReminder ? `Customer must be inactive for 30+ days (currently ${daysSinceLastOrder} days)` : "Send reminder email to customer"}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${eligibleForReminder
                      ? "bg-stone-900 text-white hover:bg-stone-800 active:scale-95 cursor-pointer"
                      : "bg-stone-100 text-stone-400 cursor-default opacity-60"
                      }`}
                  >
                    {sendingReminder ? "Sending..." : "Send Reminder"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards — 2 cols on mobile, 4 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-8 md:mb-10">
          {[
            { label: "Total Orders", value: loading ? null : orderCount, icon: "◎" },
            { label: "Total Spend", value: loading ? null : fmt(totalSpend), icon: "₹" },
            {
              label: "First Order",
              value: loading ? null : new Date(firstOrder).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              }),
              icon: "─",
            },
            {
              label: "Last Order",
              value: loading ? null : new Date(lastOrder).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              }),
              icon: "─",
            },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="bg-white border border-stone-200 rounded-2xl p-4 md:p-7
                            hover:border-stone-300 hover:shadow-lg transition-all duration-300">
              <p className="text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em]
                            uppercase text-stone-400 mb-3 md:mb-5 leading-tight">
                {label}
              </p>
              <div className="flex items-end justify-between gap-1">
                {loading ? (
                  <div className="h-7 md:h-9 w-16 md:w-20 bg-stone-100 rounded-xl animate-pulse" />
                ) : (
                  <p style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-2xl md:text-3xl lg:text-4xl text-stone-900 leading-none wrap-break-word min-w-0">
                    {value}
                  </p>
                )}
                <span className="text-base md:text-xl text-stone-200 mb-0.5 shrink-0">{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order History */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                        hover:border-stone-300 transition-all duration-300">

          {/* Section header */}
          <div className="px-4 md:px-7 py-4 md:py-5 border-b border-stone-100
                          flex justify-between items-center">
            <div>
              <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">
                History
              </p>
              <h2 style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-lg md:text-xl text-stone-900">
                Order History
              </h2>
            </div>
            {!loading && orders && (
              <p className="text-xs text-stone-400">{orders.length} orders</p>
            )}
          </div>

          {/* ── Mobile card view (< md) ─────────────────────────────────── */}
          <div className="md:hidden px-4 py-4">
            {loading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-stone-100 rounded-xl p-4 space-y-2">
                    <div className="h-3 w-3/4 bg-stone-100 rounded-full animate-pulse" />
                    <div className="h-3 w-1/2 bg-stone-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {!loading && orders?.map(order => (
              <MobileOrderCard
                key={order._id}
                order={order}
                expanded={!!expanded[order._id]}
                onToggle={toggleOrder}
                onDownload={downloadInvoice}
                productMap={productMap}
              />
            ))}
            {!loading && !orders?.length && (
              <p className="text-sm text-stone-400 text-center py-8">No orders found.</p>
            )}
          </div>

          {/* ── Desktop table view (md+) ───────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Order ID", "Items", "Status", "Total", "Date", "Actions"].map((h, i) => (
                    <th key={h}
                      className={`px-6 py-4 text-xs tracking-[0.15em] uppercase
                                    text-stone-400 font-normal
                                    ${i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {loading && [...Array(3)].map((_, i) => <SkeletonRow key={i} />)}

                {!loading && orders?.map(order => (
                  <>
                    <tr
                      key={order._id}
                      onClick={() => toggleOrder(order._id)}
                      className="hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-stone-400 text-xs font-mono">
                        <span className="mr-2 text-stone-300">
                          {expanded[order._id] ? "▾" : "▸"}
                        </span>
                        {order._id}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7
                                         rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                          {order.items.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                          ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span style={{ fontFamily: "'DM Serif Display', serif" }}
                          className="text-lg text-stone-900">
                          {fmt(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-stone-400 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadInvoice(order); }}
                          className="text-xs border border-stone-300 text-stone-700 px-3 py-1 rounded-full hover:bg-stone-100 transition-colors"
                        >
                          Download
                        </button>
                      </td>
                    </tr>

                    {expanded[order._id] && order.items.map((item, idx) => {
                      const prod = productMap?.[item.productId] || {};
                      const name = prod.name || `Product #${item.productId}`;
                      return (
                        <tr key={`${order._id}-${idx}`} className="bg-stone-50 border-t border-stone-100">
                          <td className="pl-14 pr-6 py-2.5 text-stone-500 text-xs">└ {name}</td>
                          <td className="px-6 py-2.5 text-center text-stone-400 text-xs">×{item.quantity}</td>
                          <td className="px-6 py-2.5" />
                          <td className="px-6 py-2.5 text-right text-stone-500 text-xs">{fmt(item.price * item.quantity)}</td>
                          <td className="px-6 py-2.5 text-center text-stone-300 text-xs">₹{item.price} each</td>
                        </tr>
                      );
                    })}
                  </>
                ))}

                {!loading && !orders?.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-400">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}