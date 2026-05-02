import React from "react";

const Stars = ({ rating = 0 }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const path = "M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 19.897 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z";
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className="w-4 h-4 text-stone-500" viewBox="0 0 24 24"><path d={path} fill="currentColor" /></svg>
      ))}
      {half ? <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24"><path d={path} fill="currentColor" style={{ opacity: 0.6 }} /></svg> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="w-4 h-4 text-stone-300" viewBox="0 0 24 24"><path d={path} fill="currentColor" style={{ opacity: 0.28 }} /></svg>
      ))}
    </span>
  );
};

export default function FitnessCenterDetail({ center }) {
  if (!center) return null;

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
        {center.imageUrl ? (
          <img src={center.imageUrl} alt={center.name} className="w-full h-48 object-cover" onError={e => e.currentTarget.style.display = 'none'} />
        ) : (
          <div className="text-4xl opacity-20">🏋️</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">{center.type?.replace("_", " ")}</p>
            <h3 className="font-['DM_Serif_Display'] text-xl text-stone-900">{center.name}</h3>
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={center.rating} />
              <span className="text-xs text-stone-400">{center.rating?.toFixed(1)}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${center.isOpen ? 'bg-stone-50 text-green-600' : 'bg-stone-50 text-red-600'}`}>
                {center.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <button className="text-xs px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white transition-colors">
              Visit →
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-500">
          <div>
            <p className="text-xs text-stone-400 mb-1">Address</p>
            <p className="text-sm text-stone-700">{center.address}</p>
            <p className="text-xs text-stone-400 mt-1">{center.city}, {center.state} {center.zip || ''}</p>
          </div>

          <div>
            <p className="text-xs text-stone-400 mb-1">Contact</p>
            <p className="text-sm text-stone-700">{center.contact || '—'}</p>
            <p className="text-xs text-stone-400 mt-2">Coordinates</p>
            <p className="text-sm text-stone-700">{center.lat ?? 'N/A'}, {center.lng ?? 'N/A'}</p>
          </div>
        </div>

        {center.description && (
          <div className="mt-4 text-sm text-stone-500">
            {center.description}
          </div>
        )}

        <div className="mt-4 border-t border-stone-100 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-xs text-stone-400">Rated by local users · {center.rating?.toFixed(1) || '—'}</div>
          <div className="flex items-center gap-3">
            <button className="text-xs border border-stone-300 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-colors">Call</button>
            <button className="text-xs border border-stone-300 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-colors">Get Directions</button>
          </div>
        </div>
      </div>
    </div>
  );
}
