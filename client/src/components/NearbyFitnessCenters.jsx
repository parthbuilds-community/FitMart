import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import FitnessCenterDetail from "./FitnessCenterDetail";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Stars({ rating = 0 }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const path = "M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 19.897 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z";
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={i} className="w-3 h-3 text-stone-500" viewBox="0 0 24 24"><path d={path} fill="currentColor" /></svg>
      ))}
      {half ? <svg className="w-3 h-3 text-stone-500" viewBox="0 0 24 24"><path d={path} fill="currentColor" style={{ opacity: 0.6 }} /></svg> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="w-3 h-3 text-stone-300" viewBox="0 0 24 24"><path d={path} fill="currentColor" style={{ opacity: 0.28 }} /></svg>
      ))}
    </span>
  );
}

export default function NearbyFitnessCenters({ visible = true }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const q = filter && filter !== "all" ? `?type=${filter}` : "";
        const res = await fetch(`${API}/api/fitness-centers/nearby${q}`, { headers, credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCenters(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load nearby centers:", err);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  return (
    <>
    <section className={`fade-in d1 ${visible ? "show" : ""}`}>
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Nearby</p>
          <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-stone-900">Nearby Fitness Centers</h2>
        </div>
        <div className="flex gap-2">
          {[
            { name: 'All', value: 'all' },
            { name: 'Gym', value: 'gym' },
            { name: 'Yoga', value: 'yoga' },
            { name: 'Pilates', value: 'pilates' },
          ].map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={`text-xs px-3 py-2 rounded-full transition-all ${filter === t.value ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4 animate-pulse h-36" />
          ))
        ) : centers.length === 0 ? (
          <div className="text-center py-8 text-stone-400 col-span-full">No nearby fitness centers found.</div>
        ) : (
          centers.map((c, i) => (
            <button
              key={c._id}
              type="button"
              onClick={() => { setSelected(c); setModalOpen(true); }}
              className={`select-none text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-stone-300 hover:shadow-lg transition-all duration-300 ${i < 2 ? 'relative' : ''}`}
            >
              {i < 2 && (
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-stone-900 text-white px-2 py-1 rounded-full">Near You</span>
              )}

              <div className="flex gap-3">
                <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-['DM_Serif_Display'] text-sm text-stone-900">{c.name}</h3>
                    <span className="text-[10px] text-stone-400">{c.distanceKm || 'Nearby'}</span>
                  </div>
                  <div className="mt-1 text-xs text-stone-500 flex items-center gap-2">
                    <span className="text-[10px] uppercase text-stone-400 border border-stone-200 px-2 py-1 rounded-full">{c.type}</span>
                    <Stars rating={c.rating} />
                    <span className="text-[11px] text-stone-400">{c.rating?.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                    <div>{c.isOpen ? <span className="text-green-600">Open</span> : <span className="text-red-600">Closed</span>}</div>
                    <div className="text-xs text-stone-400">{c.address}</div>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>

    {/* Modal — moved outside <section> via React Portal to escape the
        CSS transform stacking context created by the fade-in animation.
        This ensures the backdrop covers the full viewport. */}
    {modalOpen && selected && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
        {/* Fix 1: backdrop is now fixed (not absolute) — covers full viewport */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
          aria-hidden
        />

        {/* Fix 2: close button is now inside the modal card */}
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-2 border border-stone-200 shadow-md text-stone-600 hover:bg-stone-50 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          {/* Fix 3: removed redundant white box wrapper — FitnessCenterDetail renders its own */}
          <FitnessCenterDetail center={selected} />
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
