// src/pages/AdminReports.jsx
import { useState, useEffect } from "react";
import { fmt } from "../utils/formatters";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const RANGE_LABELS = {
  daily: "Last 24 Hours",
  weekly: "Last 7 Days",
  monthly: "Last 30 Days",
};

const SkeletonRow = ({ cols = 3 }) => (
  <tr className="border-b border-stone-100">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 sm:px-6 py-4 sm:py-5">
        <div
          className="h-3 bg-stone-100 rounded-full animate-pulse"
          style={{ width: `${[55, 20, 25][i] ?? 30}%`, margin: i > 0 ? "0 auto" : "0" }}
        />
      </td>
    ))}
  </tr>
);

const Empty = ({ message = "No data for this period", hint = "Try switching to a wider range" }) => (
  <tr>
    <td colSpan={3} className="py-12 sm:py-16 text-center">
      <p className="text-3xl text-stone-200 mb-3">∅</p>
      <p className="text-sm text-stone-400 mb-1">{message}</p>
      <p className="text-xs text-stone-300">{hint}</p>
    </td>
  </tr>
);

// ── Mobile card for revenue-by-date row ───────────────────────────────────
const RevenueMobileCard = ({ row }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-stone-100 last:border-0">
    <div>
      <p className="text-sm text-stone-700 font-medium">{row.date}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full
                       bg-stone-100 text-stone-600 text-xs font-medium">
        {row.orderCount}
      </span>
      <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900">
        {fmt(row.totalRevenue)}
      </span>
    </div>
  </div>
);

// ── Mobile card for product-performance row ───────────────────────────────
const ProductMobileCard = ({ p, index, productMap }) => {
  const prod = productMap?.[p.productId] || {};
  const name = prod.name || `Product #${p.productId}`;
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-stone-100 last:border-0">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                      font-medium shrink-0
                      ${index === 0 ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-400"}`}>
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 font-medium truncate">{name}</p>
        <p className="text-xs text-stone-400 mt-0.5">{p.totalQuantitySold} units sold</p>
      </div>
      <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900 shrink-0">
        {fmt(p.totalRevenue)}
      </span>
    </div>
  );
};

export default function AdminReports() {
  const navigate = useNavigate();
  const [range, setRange] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/reports/sales?range=${range}`)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => { setError("Failed to load report data"); setLoading(false); });
  }, [range]);

  const { summary, revenueByDate, productPerformance } = data || {};
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    if (!productPerformance || productPerformance.length === 0) return;
    const ids = [...new Set(productPerformance.map(p => p.productId).filter(Boolean))];
    if (ids.length === 0) return;
    const map = {};
    Promise.all(ids.map(id =>
      fetch(`${API_BASE}/products/${id}`).then(r => r.ok ? r.json() : null)
        .then(p => { if (p) map[id] = p; })
        .catch(() => { })
    )).then(() => setProductMap(map));
  }, [productPerformance]);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-in { animation: fmFade 0.5s ease forwards; }
        @keyframes fmFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">

        {/* Page heading + range pills */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
            {RANGE_LABELS[range]}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-3xl sm:text-4xl md:text-5xl text-stone-900"
            >
              Sales Reports
            </h1>

            {/* Range selector — pill buttons */}
            <div className="flex gap-2">
              {Object.entries(RANGE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`text-xs px-3 sm:px-4 py-2 rounded-full transition-all whitespace-nowrap
                              ${range === key
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">⚠ {error}</p>
            <p className="text-xs text-red-400 mt-1">Please try refreshing the page</p>
          </div>
        )}

        {/* KPI cards — 3 col on sm+, single col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-10">
          {[
            { label: "Total Revenue", value: loading ? null : fmt(summary.totalRevenue), icon: "₹" },
            { label: "Total Orders", value: loading ? null : summary.totalOrders, icon: "◎" },
            { label: "Avg Order Value", value: loading ? null : fmt(summary.avgOrderValue), icon: "─" },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                         hover:border-stone-300 hover:shadow-lg transition-all duration-300"
            >
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5">{label}</p>
              <div className="flex items-end justify-between">
                {loading ? (
                  <div className="h-8 sm:h-9 w-24 sm:w-28 bg-stone-100 rounded-xl animate-pulse" />
                ) : (
                  <p
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none"
                  >
                    {value}
                  </p>
                )}
                <span className="text-xl text-stone-200 mb-0.5">{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue by Date */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                          hover:border-stone-300 transition-all duration-300">
            <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100
                            flex justify-between items-center">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">Breakdown</p>
                <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">
                  Revenue by Date
                </h2>
              </div>
              {!loading && revenueByDate && (
                <p className="text-xs text-stone-400">{revenueByDate.length} entries</p>
              )}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden px-4 py-2">
              {loading && (
                <div className="space-y-3 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}
              {!loading && revenueByDate?.length === 0 && (
                <p className="text-center text-sm text-stone-400 py-10">No data for this period</p>
              )}
              {!loading && revenueByDate?.map(row => (
                <RevenueMobileCard key={row.date} row={row} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    {["Date", "Orders", "Revenue"].map((h, i) => (
                      <th key={h}
                        className={`px-6 py-4 text-xs tracking-[0.15em] uppercase
                                    text-stone-400 font-normal
                                    ${i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                  {!loading && revenueByDate?.length === 0 && <Empty />}
                  {!loading && revenueByDate?.map(row => (
                    <tr key={row.date} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-5 text-stone-700 font-medium">{row.date}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7
                                         rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                          {row.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900">
                          {fmt(row.totalRevenue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                          hover:border-stone-300 transition-all duration-300">
            <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100
                            flex justify-between items-center">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">Ranking</p>
                <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">
                  Product Performance
                </h2>
              </div>
              {!loading && productPerformance && (
                <p className="text-xs text-stone-400">{productPerformance.length} products</p>
              )}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden px-4 py-2">
              {loading && (
                <div className="space-y-3 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}
              {!loading && productPerformance?.length === 0 && (
                <p className="text-center text-sm text-stone-400 py-10">No product data for this period</p>
              )}
              {!loading && productPerformance?.map((p, index) => (
                <ProductMobileCard key={p.productId} p={p} index={index} productMap={productMap} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    {["Product", "Units Sold", "Revenue"].map((h, i) => (
                      <th key={h}
                        className={`px-6 py-4 text-xs tracking-[0.15em] uppercase
                                    text-stone-400 font-normal
                                    ${i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                  {!loading && productPerformance?.length === 0 && (
                    <Empty message="No product data for this period" />
                  )}
                  {!loading && productPerformance?.map((p, index) => {
                    const prod = productMap?.[p.productId] || {};
                    const name = prod.name || `Product #${p.productId}`;
                    return (
                      <tr key={p.productId} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center
                                              text-xs font-medium shrink-0
                                              ${index === 0 ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-400"}`}>
                              {index + 1}
                            </span>
                            <span className="text-stone-700 font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-700">
                            {p.totalQuantitySold}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-900">
                            {fmt(p.totalRevenue)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-stone-200 bg-white mt-10 sm:mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-10 py-5 sm:py-6
                        flex justify-between items-center">
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400">Sales Reports · © 2026</p>
        </div>
      </footer>
    </div>
  );
}