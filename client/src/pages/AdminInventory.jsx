// src/pages/AdminInventory.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const LOW_STOCK_THRESHOLD = 5;
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const statusConfig = (p) => {
  const isUnavailable = p.stock === null;
  const available = isUnavailable ? null : p.stock - p.reserved;
  const isLow = !isUnavailable && available < LOW_STOCK_THRESHOLD;

  if (isUnavailable) return { label: "Not Available", style: "bg-yellow-50 border border-yellow-200 text-yellow-700" };
  if (isLow) return { label: "Low Stock", style: "bg-red-50 border border-red-200 text-red-600" };
  return { label: "In Stock", style: "bg-green-50 border border-green-200 text-green-700" };
};

// Returns effective status, considering admin-set `badge` when it's one of the allowed values
const getStatus = (p) => {
  const base = statusConfig(p);
  const allowedBadges = ["In Stock", "Low Stock", "Not Available"];
  if (p.badge && allowedBadges.includes(p.badge)) {
    let style = base.style;
    if (p.badge === 'Not Available') style = "bg-yellow-50 border border-yellow-200 text-yellow-700";
    else if (p.badge === 'Low Stock') style = "bg-red-50 border border-red-200 text-red-600";
    else if (p.badge === 'In Stock') style = "bg-green-50 border border-green-200 text-green-700";
    return { label: p.badge, style };
  }
  return base;
};

const SkeletonRow = () => (
  <tr className="border-b border-stone-100">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="h-3 bg-stone-100 rounded-full animate-pulse"
          style={{ width: `${[60, 40, 20, 20, 20, 30, 10][i]}%`, margin: i > 1 ? "0 auto" : "0" }} />
      </td>
    ))}
  </tr>
);

// ── Mobile product card ───────────────────────────────────────────────────
const InventoryMobileCard = ({ p, onEdit }) => {
  const isUnlimited = p.stock === null;
  const available = isUnlimited ? null : p.stock - p.reserved;
  const { label, style } = getStatus(p);

  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-4 flex gap-3">
      {p.image && (
        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0">
          <img src={p.image} alt={p.name}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = "none"; }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 leading-tight truncate">{p.name}</p>
            {p.brand && (
              <p className="text-[10px] tracking-[0.12em] uppercase text-stone-400 mt-0.5">{p.brand}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full
                            font-medium shrink-0 ${style}`}>
              {label}
            </span>
            <button onClick={() => onEdit(p)} className="p-1 rounded-md hover:bg-stone-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 15.25A3.25 3.25 0 015.25 12H6v1.5A2.5 2.5 0 008.5 16H14v1H8.5A3.5 3.5 0 015 13.5V13H4A2 2 0 012 11V5h1v6a1 1 0 001 1h1v1.25z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-stone-400 border border-stone-200 px-2 py-0.5 rounded-full">
            {p.category || "—"}
          </span>
          <span className="text-xs text-stone-500">
            Stock: <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-stone-900">
              {isUnlimited ? "N/A" : p.stock}
            </span>
          </span>
          <span className="text-xs text-stone-500">
            Avail: <span style={{ fontFamily: "'DM Serif Display', serif" }}
              className={!isUnlimited && available < LOW_STOCK_THRESHOLD ? "text-red-600" : "text-stone-900"}>
              {isUnlimited ? "N/A" : available}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-lg max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default function AdminInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const [saving, setSaving] = useState(false);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load inventory');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const stats = {
    total: products.length,
    low: products.filter(p => getStatus(p).label === 'Low Stock').length,
    inStock: products.filter(p => getStatus(p).label === 'In Stock').length,
    unlimited: products.filter(p => getStatus(p).label === 'Not Available').length,
  };

  const filtered = products.filter(p => {
    const status = getStatus(p).label;
    if (filter === "low") return status === 'Low Stock';
    if (filter === "in") return status === 'In Stock';
    if (filter === "unlimited") return status === 'Not Available';
    return true;
  });

  const openEditor = (p) => {
    // Prepare editable copy. Use badge as status storage if present.
    setEditing({
      ...p,
      // normalize stock/reserved to editable values
      stock: p.stock === null ? '' : p.stock,
      reserved: p.reserved ?? 0,
      badge: p.badge || '',
      available: p.stock === null ? '' : (p.stock - (p.reserved ?? 0)),
    });
  };

  const closeEditor = () => setEditing(null);

  const handleChange = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const id = Number(editing.productId);
      // prepare payload: convert empty stock to null
      const payload = {
        name: editing.name,
        brand: editing.brand,
        category: editing.category,
        badge: editing.badge || null,
      };

      // parse numbers
      if (editing.stock === '' || editing.stock === null) {
        payload.stock = null;
      } else {
        payload.stock = Number(editing.stock);
      }

      payload.reserved = Number(editing.reserved) || 0;

      // if available was edited directly, reconcile by setting reserved = stock - available
      if (editing.available !== undefined && editing.available !== null && editing.available !== '') {
        const avail = Number(editing.available);
        if (payload.stock !== null) {
          // compute reserved to match available (clamp to >=0)
          payload.reserved = Math.max(0, payload.stock - avail);
        }
      }

      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Save failed');
      }
      // refresh full list from server to ensure consistency
      await fetchProducts();
      setSaving(false);
      setEditing(null);
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to save product');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-in { animation: fmFade 0.5s ease forwards; }
        @keyframes fmFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">

        {/* Page heading */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Stock Management</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900">
            Inventory
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-6 py-4 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">⚠ {error}</p>
          </div>
        )}

        {/* KPI strip — 2×2 on mobile, 4-col on md+ */}
        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
            {[
              { label: "Total Products", value: loading ? "—" : stats.total, icon: "◎" },
              { label: "In Stock", value: loading ? "—" : stats.inStock, icon: "✓" },
              { label: "Low Stock", value: loading ? "—" : stats.low, icon: "⚡" },
              { label: "Not Available", value: loading ? "—" : stats.unlimited, icon: "─" },
            ].map(({ label, value, icon }) => (
              <div key={label}
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6
                           hover:border-stone-300 hover:shadow-lg transition-all duration-300">
                <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em]
                              uppercase text-stone-400 mb-3 sm:mb-4 leading-tight">
                  {label}
                </p>
                <div className="flex items-end justify-between">
                  <p style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-3xl sm:text-4xl text-stone-900 leading-none">
                    {value}
                  </p>
                  <span className="text-lg sm:text-xl text-stone-300 mb-0.5">{icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter pills — horizontal scroll on mobile */}
        {!loading && !error && (
          <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1
                          scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {[
              { key: "all", label: `All (${stats.total})` },
              { key: "in", label: `In Stock (${stats.inStock})` },
              { key: "low", label: `Low Stock (${stats.low})` },
              { key: "unlimited", label: `Not Available (${stats.unlimited})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap shrink-0
                            ${filter === key
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                        hover:border-stone-300 transition-all duration-300">
          {/* Card header */}
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100
                          flex justify-between items-center">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">Live Data</p>
              <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">
                Stock Levels
              </h2>
            </div>
            {!loading && (
              <p className="text-xs text-stone-400">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Mobile card list */}
          <div className="md:hidden p-4 space-y-3">
            {loading && (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
              ))
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-3xl text-stone-200 mb-3">∅</p>
                <p className="text-sm text-stone-400">No products match this filter</p>
              </div>
            )}
            {!loading && filtered.map(p => <InventoryMobileCard key={p.productId} p={p} onEdit={openEditor} />)}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Product", "Category", "Stock", "Reserved", "Available", "Status", "Actions"].map(h => (
                    <th key={h}
                      className={`px-6 py-4 text-xs tracking-[0.15em] uppercase text-stone-400
                                  font-normal ${h !== "Product" && h !== "Category" ? "text-center" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <p className="text-3xl text-stone-200 mb-3">∅</p>
                      <p className="text-sm text-stone-400">No products match this filter</p>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map(p => {
                  const isUnlimited = p.stock === null;
                  const available = isUnlimited ? null : p.stock - p.reserved;
                  const { label, style } = getStatus(p);

                  return (
                    <tr key={p.productId} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <div className="w-9 h-9 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                              <img src={p.image} alt={p.name}
                                className="w-full h-full object-cover"
                                onError={e => { e.currentTarget.style.display = "none"; }} />
                            </div>
                          )}
                          <div>
                            <p className="text-stone-900 font-medium leading-tight">{p.name}</p>
                            {p.brand && (
                              <p className="text-[10px] tracking-[0.12em] uppercase text-stone-400 mt-0.5">
                                {p.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-stone-400 border border-stone-200 px-2.5 py-1 rounded-full">
                          {p.category || "─"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-stone-700">
                          {isUnlimited ? "N/A" : p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-stone-400 text-sm">{p.reserved ?? 0}</td>
                      <td className="px-6 py-5 text-center">
                        <span style={{ fontFamily: "'DM Serif Display', serif" }}
                          className={`text-lg ${!isUnlimited && available < LOW_STOCK_THRESHOLD ? "text-red-600" : "text-stone-900"}`}>
                          {isUnlimited ? "N/A" : available}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full font-medium ${style}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => openEditor(p)} className="p-1 rounded-md hover:bg-stone-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 15.25A3.25 3.25 0 015.25 12H6v1.5A2.5 2.5 0 008.5 16H14v1H8.5A3.5 3.5 0 015 13.5V13H4A2 2 0 012 11V5h1v6a1 1 0 001 1h1v1.25z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="border-t border-stone-200 bg-white mt-10 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-5 sm:py-6
                        flex justify-between items-center">
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400">Inventory Management · © 2026</p>
        </div>
      </footer>

      <Modal open={!!editing} onClose={closeEditor}>
        {editing && (
          <div>
            <div className="flex items-start justify-between mb-4">
              <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">Edit Product</h3>
              <button onClick={closeEditor} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500">Product</label>
                <input value={editing.name} onChange={e => handleChange('name', e.target.value)} className="mt-1 block w-full border border-stone-200 rounded-md p-2" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Category</label>
                <input value={editing.category || ''} onChange={e => handleChange('category', e.target.value)} className="mt-1 block w-full border border-stone-200 rounded-md p-2" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Stock (empty = Not Available)</label>
                <input type="number" value={editing.stock === '' ? '' : editing.stock} onChange={e => handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full border border-stone-200 rounded-md p-2" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Reserved</label>
                <input type="number" value={editing.reserved} onChange={e => handleChange('reserved', Number(e.target.value))} className="mt-1 block w-full border border-stone-200 rounded-md p-2" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Available</label>
                <input type="number" value={editing.available === '' ? '' : editing.available} onChange={e => handleChange('available', e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full border border-stone-200 rounded-md p-2" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Status</label>
                <select value={editing.badge || ''} onChange={e => {
                  const v = e.target.value;
                  // if Not Available selected, clear stock to represent unavailable
                  if (v === 'Not Available') handleChange('stock', '');
                  handleChange('badge', v);
                }} className="mt-1 block w-full border border-stone-200 rounded-md p-2">
                  <option value="">(Auto)</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={closeEditor} className="px-4 py-2 rounded-md border border-stone-200 w-full sm:w-auto">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-stone-900 text-white rounded-md w-full sm:w-auto">
                {saving ? 'Saving…' : 'Update'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}