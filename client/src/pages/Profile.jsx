// src/pages/Profile.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import {
  getRewardTier,
  getTierProgress,
  formatRelativeDate,
  getTransactionLabel,
  getTransactionIcon,
} from "../utils/rewardsUtils";
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
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [rewardsData, setRewardsData] = useState(null);
const [rewardsLoading, setRewardsLoading] = useState(false);
const [rewardsError, setRewardsError] = useState("");

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
        // Load saved photo URL from database
        if (data.photoURL) {
          setPhotoURL(data.photoURL);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);
    const fetchRewardsData = async () => {
    try {
      setRewardsLoading(true);
      setRewardsError("");

      const headers = await getAuthHeaders();

      const response = await fetch(`${API}/api/rewards/me`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rewards data");
      }

      const data = await response.json();
      setRewardsData(data);
    } catch (error) {
      setRewardsError(error.message || "Could not load FitRewards");
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "fitrewards" && !rewardsData) {
      fetchRewardsData();
    }
  }, [activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab !== "orders") return;
    
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      setLoadingOrders(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API}/api/orders/${user.uid}`, { headers, credentials: "include" });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      // Upload photo via backend endpoint
      const formData = new FormData();
      formData.append("photo", file);

      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/user/upload-photo/${user.uid}`, {
        method: "POST",
        headers: {
          "Authorization": headers.Authorization,
        },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload photo");
      }

      const data = await res.json();
      const photoURL = data.photoURL;

      // Update local state with returned photo URL
      setPhotoURL(photoURL);
      setToast("Profile photo updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
  { id: "fitrewards", label: "FitRewards" },
  { id: "orders", label: "Orders" },
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
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
                {/* ── FITREWARDS TAB ── */}
        {activeTab === "fitrewards" && (
          <FitRewardsTab
            rewardsData={rewardsData}
            rewardsLoading={rewardsLoading}
            rewardsError={rewardsError}
          />
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">Order history</p>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-sm text-stone-400">Loading orders…</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
                <p className="text-2xl mb-3">📦</p>
                <p className="text-sm text-stone-500 mb-1">No orders yet.</p>
                <p className="text-xs text-stone-400 mb-5">Start shopping to see your order history here.</p>
                <button
                  onClick={() => navigate("/home")}
                  className="bg-stone-900 text-white text-sm px-6 py-2.5 rounded-full hover:bg-stone-700 transition-colors"
                >
                  Shop now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-900">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-stone-900">₹{order.total.toFixed(2)}</p>
                          <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${
                            order.status === 'paid' 
                              ? 'bg-green-50 text-green-700' 
                              : order.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="pt-3 border-t border-stone-100 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-600">
                          <span>Product ID {item.productId} × {item.quantity}</span>
                          <span className="text-stone-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
const FitRewardsTab = ({ rewardsData, rewardsLoading, rewardsError }) => {
  if (rewardsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-stone-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-stone-200" />
          <div className="mt-5 h-12 w-40 rounded bg-stone-200" />
          <div className="mt-4 h-4 w-24 rounded bg-stone-200" />
          <div className="mt-6 h-2 w-full rounded-full bg-stone-200" />
          <div className="mt-3 h-4 w-48 rounded bg-stone-200" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-stone-200" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-stone-200" />
                  <div className="mt-2 h-3 w-24 rounded bg-stone-200" />
                </div>
                <div className="h-4 w-16 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rewardsError) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-6 text-stone-700">
        {rewardsError}
      </div>
    );
  }

  const points =
    rewardsData?.points ??
    rewardsData?.balance ??
    rewardsData?.currentPoints ??
    0;

  const transactions = rewardsData?.transactions || [];

  const { currentTier } = getRewardTier(points);
  const tierProgress = getTierProgress(points);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">
              Current FitRewards Points
            </p>

            <h2 className="mt-2 font-serif text-5xl font-semibold text-stone-900">
              {points}
            </h2>
          </div>

          <span className="w-fit rounded-full bg-stone-900 px-4 py-1 text-sm font-medium text-white">
            {currentTier.name}
          </span>
        </div>

        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-stone-900 transition-all"
              style={{ width: `${tierProgress.progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-stone-600">{tierProgress.label}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-900">
          Transaction History
        </h3>

        {transactions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <div className="text-4xl">⭐</div>
            <h4 className="mt-3 text-base font-semibold text-stone-900">
              No rewards yet
            </h4>
            <p className="mt-2 text-sm text-stone-600">
              Make your first purchase or complete rewards activity to start
              earning FitRewards points.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction._id || transaction.id}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-lg">
                  {getTransactionIcon(transaction)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {getTransactionLabel(transaction)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatRelativeDate(
                      transaction.createdAt || transaction.date
                    )}
                  </p>
                </div>

                <p className="text-sm font-semibold text-stone-900">
                  +{transaction.points || transaction.amount || 0} pts
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
