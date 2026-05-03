// src/pages/Profile.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-stone-900 text-white text-sm px-5 py-3.5 rounded-full shadow-lg animate-fade-up"
    >
      <span className="text-green-400 text-base">✓</span>
      {message}
    </div>
  );
}

function Avatar({ name, photoURL, size = 96 }) {
  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, minWidth: size }}
    >
      {photoURL ? (
        <img src={photoURL} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: size * 0.36 }}
          className="text-stone-500 select-none"
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function AddressCard({ address, isDefault, onEdit, onRemove, onSetDefault }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-stone-900">{address.label}</span>
            {isDefault && (
              <span className="text-[10px] tracking-widest uppercase bg-stone-900 text-white px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 leading-relaxed">
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="text-sm text-stone-500">
            {[address.city, address.state, address.zip].filter(Boolean).join(", ")}
          </p>
          {address.country && (
            <p className="text-sm text-stone-400">{address.country}</p>
          )}
          {address.phone && (
            <p className="text-xs text-stone-400 mt-1">{address.phone}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-xs border border-stone-200 text-stone-700 px-3 py-1.5 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
            >
              Edit
            </button>
            <button
              onClick={onRemove}
              className="text-xs border border-red-100 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all"
            >
              Remove
            </button>
          </div>
          {!isDefault && (
            <button
              onClick={onSetDefault}
              className="text-[10px] tracking-wide text-stone-400 hover:text-stone-700 transition-colors uppercase"
            >
              Set as default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState({ name: "", phone: "", addresses: [], defaultAddressId: undefined });
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef();
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => { document.title = "Profile – FitMart"; }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/auth"); return; }
      setPhotoURL(user.photoURL);
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API}/api/user/profile/${user.uid}`, { headers, credentials: "include" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile({
          name: data.name || user.displayName || "",
          phone: data.phone || "",
          addresses: data.addresses || [],
          defaultAddressId: data.defaultAddressId,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return navigate("/auth");
    setError(null);
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/user/profile/${user.uid}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          addresses: profile.addresses,
          defaultAddressId: profile.defaultAddressId,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const data = await res.json();
      setProfile((prev) => ({ ...prev, ...data }));
      setToast("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addAddress = () => {
    setEditingAddress({
      id: `${Date.now()}`,
      label: "Home",
      line1: "", line2: "", city: "", state: "", zip: "", country: "",
      phone: profile.phone || "",
    });
  };

  const editAddress = (a) => setEditingAddress({ ...a });

  const removeAddress = (id) => {
    setProfile((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
      defaultAddressId: prev.defaultAddressId === id ? undefined : prev.defaultAddressId,
    }));
  };

  const saveEditingAddress = () => {
    if (!editingAddress) return;
    setProfile((prev) => {
      const exists = prev.addresses.find((a) => a.id === editingAddress.id);
      const addresses = exists
        ? prev.addresses.map((a) => (a.id === editingAddress.id ? editingAddress : a))
        : [...prev.addresses, editingAddress];
      return { ...prev, addresses };
    });
    setEditingAddress(null);
    setToast(editingAddress ? "Address saved" : "Address added");
  };

  const tabs = [
    { id: "profile", label: "Personal Info" },
    { id: "addresses", label: "Addresses" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar variant="home" menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-sm text-stone-400 tracking-wide">Loading your profile…</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar variant="home" menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');`}</style>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Hero band */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-0">

          {/* Profile header */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-6">
            <div className="relative w-fit">
              <Avatar name={profile.name} photoURL={photoURL} size={88} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-stone-700 transition-colors"
                title="Change photo"
              >
                ✎
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">Account</p>
              <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-stone-900 leading-tight">
                {profile.name || "Your Profile"}
              </h1>
              {auth.currentUser?.email && (
                <p className="text-sm text-stone-400 mt-0.5">{auth.currentUser.email}</p>
              )}
            </div>
            <button
              onClick={() => navigate("/home")}
              className="self-start sm:self-auto border border-stone-200 text-stone-700 text-sm px-5 py-2 rounded-full hover:bg-stone-100 transition-colors shrink-0"
            >
              ← Shop
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-stone-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm pb-3 transition-colors relative ${activeTab === tab.id
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── PERSONAL INFO TAB ── */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">Basic details</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Full Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Phone</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Email</label>
                  <input
                    value={auth.currentUser?.email || ""}
                    disabled
                    className="w-full border border-stone-200 bg-stone-100 rounded-lg px-4 py-3 text-sm text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400 mt-1.5">Email cannot be changed here.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full hover:bg-stone-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === "addresses" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400">
                {profile.addresses.length} address{profile.addresses.length !== 1 ? "es" : ""}
              </p>
              <button
                onClick={addAddress}
                className="text-xs border border-stone-200 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
              >
                + Add address
              </button>
            </div>

            {profile.addresses.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
                <p className="text-2xl mb-3">∅</p>
                <p className="text-sm text-stone-500 mb-1">No addresses saved yet.</p>
                <p className="text-xs text-stone-400">Add one to speed up checkout.</p>
                <button
                  onClick={addAddress}
                  className="mt-5 bg-stone-900 text-white text-sm px-6 py-2.5 rounded-full hover:bg-stone-700 transition-colors"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.addresses.map((a) => (
                  <AddressCard
                    key={a.id}
                    address={a}
                    isDefault={profile.defaultAddressId === a.id}
                    onEdit={() => editAddress(a)}
                    onRemove={() => removeAddress(a.id)}
                    onSetDefault={() => setProfile((prev) => ({ ...prev, defaultAddressId: a.id }))}
                  />
                ))}

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full hover:bg-stone-700 transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Addresses"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADDRESS MODAL ── */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingAddress(null)} />
          <div
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-stone-900">
                {profile.addresses.find((a) => a.id === editingAddress.id) ? "Edit address" : "New address"}
              </h3>
              <button
                onClick={() => setEditingAddress(null)}
                className="text-stone-400 hover:text-stone-700 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Label</label>
                <input
                  value={editingAddress.label}
                  onChange={(e) => setEditingAddress((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Home, Work, etc."
                  className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Address line 1</label>
                <input
                  value={editingAddress.line1}
                  onChange={(e) => setEditingAddress((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="Street, building"
                  className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Address line 2 <span className="normal-case text-stone-300">(optional)</span></label>
                <input
                  value={editingAddress.line2}
                  onChange={(e) => setEditingAddress((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="Apartment, floor, suite"
                  className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">City</label>
                  <input
                    value={editingAddress.city}
                    onChange={(e) => setEditingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">State</label>
                  <input
                    value={editingAddress.state}
                    onChange={(e) => setEditingAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">ZIP / Pincode</label>
                  <input
                    value={editingAddress.zip}
                    onChange={(e) => setEditingAddress((prev) => ({ ...prev, zip: e.target.value }))}
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Country</label>
                  <input
                    value={editingAddress.country}
                    onChange={(e) => setEditingAddress((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1.5">Phone</label>
                <input
                  value={editingAddress.phone}
                  onChange={(e) => setEditingAddress((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full border border-stone-200 bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingAddress(null)}
                className="flex-1 border border-stone-200 text-stone-700 text-sm py-3 rounded-full hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditingAddress}
                className="flex-1 bg-stone-900 text-white text-sm py-3 rounded-full hover:bg-stone-700 transition-colors"
              >
                Save address
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-up { animation: fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </div>
  );
}