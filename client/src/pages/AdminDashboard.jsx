// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const STATUS_STYLES = {
  paid: "bg-stone-900 text-white",
  created: "border border-stone-300 text-stone-600",
  failed: "bg-red-50 border border-red-100 text-red-600",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm shadow-lg">
      <p className="text-xs text-stone-400 uppercase tracking-[0.12em] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-medium text-stone-900">
          {p.name === "revenue" ? fmt(p.value) : `${p.value} units`}
        </p>
      ))}
    </div>
  );
};

const KPICard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                  hover:border-stone-300 hover:shadow-lg transition-all duration-300">
    <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em]
                  uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
      {label}
    </p>
    <div className="flex items-end justify-between">
      <p style={{ fontFamily: "'DM Serif Display', serif" }}
        className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none wrap-break-word min-w-0">
        {value}
      </p>
      <div className="text-xl sm:text-2xl opacity-40 mb-0.5 shrink-0 ml-2">
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>
    </div>
    {sub && <p className="text-xs text-stone-400 mt-2 sm:mt-3">{sub}</p>}
  </div>
);

const SectionCard = ({ title, eyebrow, children }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                  hover:border-stone-300 transition-all duration-300">
    {eyebrow && (
      <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">{eyebrow}</p>
    )}
    <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900 mb-5 sm:mb-6">
      {title}
    </h2>
    {children}
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`bg-stone-100 rounded-2xl animate-pulse ${className}`} />
);

const Empty = () => (
  <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
    <p className="text-3xl text-stone-300 mb-3">∅</p>
    <p className="text-sm text-stone-400">No data for this period</p>
  </div>
);

const CustomerAvatar = ({ name, photoURL }) => (
  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0
                  bg-stone-200 flex items-center justify-center">
    {photoURL ? (
      <img src={photoURL} alt={name || "avatar"}
        className="w-full h-full object-cover" referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = "none"; }} />
    ) : (
      <span className="text-[11px] font-medium text-stone-600">
        {(name?.[0] || "?").toUpperCase()}
      </span>
    )}
  </div>
);

// ── Mobile order card ─────────────────────────────────────────────────────
const OrderMobileCard = ({ order }) => (
  <div className="py-3.5 border-b border-stone-100 last:border-0">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <CustomerAvatar name={order.customerName} photoURL={order.customerPhoto} />
        <span className="text-xs font-medium text-stone-700 truncate max-w-25">
          {order.customerName && order.customerName !== "—"
            ? order.customerName
            : order.userId?.slice(0, 10) + "…"}
        </span>
      </div>
      <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-base text-stone-900">
        {fmt(order.total)}
      </span>
    </div>
    <div className="flex items-center justify-between pl-9">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-stone-400">
          #{order._id?.slice(-6).toUpperCase()}
        </span>
        <span className="text-[10px] text-stone-400">{fmtDate(order.createdAt)}</span>
      </div>
      <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-medium
                        ${STATUS_STYLES[order.status] || "border border-stone-200 text-stone-500"}`}>
        {order.status}
      </span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [range, setRange] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/dashboard?range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AdminNavbar range={range} setRange={setRange} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fitmart-chart .recharts-cartesian-grid-horizontal line,
        .fitmart-chart .recharts-cartesian-grid-vertical line { stroke: #e7e5e3; }
        .fitmart-chart .recharts-tooltip-cursor { fill: #f5f5f4; }
        .fade-in { animation: fmFadeIn 0.5s ease forwards; }
        @keyframes fmFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">

        {/* ── Admin feature cards ── */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Overview</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-6 sm:mb-8">
            Command Centre
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                href: "/admin/inventory", title: "Inventory",
                desc: "Manage products, track stock levels, and update pricing across your catalog.",
                cta: "Manage inventory →",
                icon: (
                  <svg className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors duration-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
              },
              {
                href: "/admin/customers", title: "Customers",
                desc: "View customer profiles, order history, and engagement analytics.",
                cta: "View customers →",
                icon: (
                  <svg className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors duration-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                href: "/admin/reports", title: "Reports",
                desc: "Generate insights with sales analytics, revenue tracking, and performance metrics.",
                cta: "View reports →",
                icon: (
                  <svg className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors duration-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                href: "/admin/marketing", title: "Marketing",
                desc: "Manage marketing campaigns, promotions, and customer communications.",
                cta: "View marketing →",
                icon: (
                  <svg className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors duration-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 3v16a2 2 0 002 2h16M7 16l3-4 3 3 5-6" />
                  </svg>
                ),
              },
              {
                href: "/admin/bugs", title: "Bug Reports",
                desc: "View and triage bug reports submitted by users.",
                cta: "View bug reports →",
                icon: (
                  <svg className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2M6.2 4.2l1.4 1.4M2 12h2M4.2 17.8l1.4-1.4M12 20v2M17.8 19.8l-1.4-1.4M20 12h2M19.8 6.2l-1.4 1.4M7 11a5 5 0 1010 0 5 5 0 00-10 0z" />
                  </svg>
                ),
              },
            ].map(card => (
              <div key={card.href}
                onClick={() => window.location.href = card.href}
                onPointerDown={(e) => { if (e?.nativeEvent?.pointerType === 'touch') e.preventDefault(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = card.href; } }}
                role="button" tabIndex={0}
                className="group cursor-pointer select-none sm:select-auto bg-white border border-stone-200 rounded-2xl p-5 sm:p-6
                           hover:border-stone-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-100 flex items-center justify-center
                                  group-hover:bg-stone-900 transition-colors duration-300">
                    {card.icon}
                  </div>
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-xl text-stone-900 mb-2 select-none sm:select-auto">{card.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed mb-4 select-none sm:select-auto">{card.desc}</p>
                <div className="flex items-center text-xs text-stone-400 group-hover:text-stone-600 transition-colors">
                  <span>{card.cta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl md:text-4xl text-stone-900">
            Dashboard
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">⚠ {error} — make sure the backend server is running.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 sm:h-36" />)}
            </div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <Skeleton className="h-60 sm:h-72" />
              <Skeleton className="h-60 sm:h-72" />
            </div>
            <Skeleton className="h-72 sm:h-80" />
          </div>
        )}

        {!loading && data && (
          <div className="fade-in space-y-4 sm:space-y-5">

            {/* KPI row — 2×2 on mobile, 4-col on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              <KPICard label="Total Revenue" value={fmt(data.kpis.totalRevenue)} icon="₹" />
              <KPICard label="Total Orders" value={data.kpis.totalOrders.toLocaleString()} icon="◎" />
              <KPICard label="Customers" value={data.kpis.totalCustomers.toLocaleString()}
                icon={
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <KPICard label="Low on Stock" value={data.kpis.lowStockCount}
                sub="Below 5 units" icon="─" />
            </div>

            {/* Charts — stacked on mobile, side-by-side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <SectionCard eyebrow="Analytics" title="Revenue Over Time">
                {data.revenueOverTime.length === 0 ? <Empty /> : (
                  <div className="fitmart-chart">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={data.revenueOverTime}
                        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1c1917" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="#1c1917" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" />
                        <XAxis dataKey="date"
                          tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }}
                          tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }}
                          tickLine={false} axisLine={false}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="revenue"
                          stroke="#1c1917" strokeWidth={2} fill="url(#revGrad)"
                          dot={false} activeDot={{ r: 4, fill: "#1c1917", strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>

              <SectionCard eyebrow="Performance" title="Top 5 Selling Products">
                {data.topProducts.length === 0 ? <Empty /> : (
                  <div className="fitmart-chart">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.topProducts} layout="vertical"
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" horizontal={false} />
                        <XAxis type="number"
                          tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }}
                          tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category"
                          tick={{ fill: "#78716c", fontSize: 10, fontFamily: "'DM Sans'" }}
                          tickLine={false} axisLine={false} width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalQuantity" name="revenue" fill="#1c1917" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Recent Orders */}
            <SectionCard eyebrow="Transactions" title="Recent Orders">
              {/* Mobile card view */}
              <div className="md:hidden">
                {data.recentOrders.length === 0 ? (
                  <p className="text-center text-sm text-stone-400 py-8">∅ No recent orders</p>
                ) : (
                  data.recentOrders.map(order => <OrderMobileCard key={order._id} order={order} />)
                )}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {["Order ID", "Customer", "Email", "Items", "Total", "Status", "Date"].map((h) => (
                        <th key={h}
                          className="pb-4 text-left text-xs tracking-[0.15em] uppercase
                                     text-stone-400 font-normal whitespace-nowrap pr-6 last:pr-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">
                          ∅ No recent orders
                        </td>
                      </tr>
                    ) : (
                      data.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 pr-6">
                            <span className="font-mono text-xs text-stone-400">
                              #{order._id?.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 pr-6">
                            {order.customerName && order.customerName !== "—" ? (
                              <div className="flex items-center gap-2.5">
                                <CustomerAvatar name={order.customerName} photoURL={order.customerPhoto} />
                                <span className="text-xs text-stone-700 font-medium">{order.customerName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400 font-mono">
                                {order.userId?.slice(0, 12)}…
                              </span>
                            )}
                          </td>
                          <td className="py-4 pr-6">
                            {order.customerEmail && order.customerEmail !== "—" ? (
                              <span className="text-xs text-stone-500">{order.customerEmail}</span>
                            ) : (
                              <span className="text-xs text-stone-300">—</span>
                            )}
                          </td>
                          <td className="py-4 pr-6 text-stone-400 text-xs">
                            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                          </td>
                          <td className="py-4 pr-6">
                            <span style={{ fontFamily: "'DM Serif Display', serif" }}
                              className="text-base text-stone-900">
                              {fmt(order.total)}
                            </span>
                          </td>
                          <td className="py-4 pr-6">
                            <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full
                                              font-medium whitespace-nowrap
                                              ${STATUS_STYLES[order.status] || "border border-stone-200 text-stone-500"}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-stone-400 whitespace-nowrap">
                            {fmtDate(order.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <footer className="border-t border-stone-200 bg-white mt-10 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-5 sm:py-6
                        flex justify-between items-center">
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400">Admin Dashboard · © 2026</p>
        </div>
      </footer>
    </div>
  );
}