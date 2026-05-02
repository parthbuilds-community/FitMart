// src/components/AdminNavbar.jsx
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";

export default function AdminNavbar({ range, setRange, menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    setMenuOpen?.(false);
    navigate("/");
  };

  const ranges = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },      // shortened for mobile
    { key: "month", label: "Month" },
  ];

  return (
    <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-14 sm:h-16
                      flex items-center justify-between gap-3">

        {/* ── Brand ── */}
        <div
          className="flex items-center gap-2 sm:gap-4 cursor-pointer shrink-0"
          onClick={() => navigate("/admin/dashboard")}
        >
          <span
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-lg sm:text-xl text-stone-900 tracking-tight"
          >
            FitMart
          </span>
          <div className="h-4 w-px bg-stone-200 hidden sm:block" />
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 hidden sm:block">
            Admin
          </p>
          {/* Mobile-only compact label */}
          <span className="text-[9px] tracking-[0.15em] uppercase text-stone-400
                           border border-stone-200 rounded-full px-2 py-0.5 sm:hidden">
            Admin
          </span>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">

          {/* Range buttons — scrollable row on mobile */}
          {setRange && range !== undefined ? (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
              {ranges.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all
                              cursor-pointer shrink-0 min-h-8.5
                              ${range === key
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="border border-stone-200 text-stone-600 text-xs px-3 sm:px-5
                         py-2 rounded-full hover:bg-stone-900 hover:text-white
                         hover:border-stone-900 transition-all cursor-pointer
                         min-h-9 shrink-0"
            >
              <span className="hidden sm:inline">← Go to Dashboard</span>
              <span className="sm:hidden">← Dashboard</span>
            </button>
          )}

          {/* ── Profile dropdown ── */}
          {!authLoading && (
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen?.((p) => !p)}
                className="flex items-center gap-2 border border-stone-200 rounded-full
                           px-2 sm:px-2.5 py-1.5 hover:bg-stone-50 transition-colors
                           ml-0.5 sm:ml-1 cursor-pointer min-h-9"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0
                                bg-stone-200 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "avatar"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[11px] font-medium text-stone-600">
                      {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen?.(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white
                                  border border-stone-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-medium text-stone-900 truncate">
                        {user?.displayName || "Account"}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <div className="border-t border-stone-100 mt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left text-xs text-stone-500 hover:bg-stone-50
                                   px-4 py-2.5 transition-colors cursor-pointer min-h-9"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}