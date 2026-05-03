// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";

export default function Navbar({
  variant = "landing",
  navOpaque = true,
  onSearchToggle,
  cartCount = 0,
  onCartOpen,
  menuOpen = false,
  setMenuOpen,
  onSignOut,
}) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut(auth);
      navigate("/");
    }
    setMenuOpen?.(false);
  };

  const isLanding = variant === "landing";

  const positionClass = isLanding
    ? "fixed top-0 left-0 right-0 z-50"
    : "sticky top-0 z-40";

  const bgClass = isLanding
    ? navOpaque
      ? "bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm"
      : "bg-transparent"
    : "bg-white border-b border-stone-200";

  const logoColor = isLanding && !navOpaque ? "text-white" : "text-stone-900";
  const iconColor =
    isLanding && !navOpaque
      ? "text-white/80 hover:text-white"
      : "text-stone-500 hover:text-stone-900";

  return (
    <nav className={`w-full ${positionClass} transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-14 sm:h-16
                      flex items-center justify-between">

        {/* ── Brand ── */}
        <span
          className={`font-['DM_Serif_Display'] text-lg sm:text-xl tracking-tight
                       cursor-pointer transition-colors ${logoColor}`}
          onClick={() => {
            if (isLanding) window.scrollTo({ top: 0, behavior: "smooth" });
            else navigate("/home");
          }}
        >
          FitMart
        </span>

        {/* ── Right side ── */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">

          {/* Search icon — home only */}
          {onSearchToggle && (
            <button
              onClick={onSearchToggle}
              className={`p-2 transition-colors min-w-[40px] min-h-[40px] flex items-center
                          justify-center rounded-full ${iconColor}`}
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={1.8} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
            </button>
          )}

          {/* Cart icon — home only */}
          {onCartOpen && (
            <button
              onClick={onCartOpen}
              className={`relative p-2 transition-colors min-w-[40px] min-h-[40px]
                          flex items-center justify-center rounded-full ${iconColor}`}
              aria-label="Cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-stone-900 text-white
                                 text-[9px] w-4 h-4 rounded-full flex items-center
                                 justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* ── Auth area ── */}
          {!authLoading && (
            <>
              {user ? (
                /* ── Logged IN: avatar + dropdown ── */
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen?.((p) => !p)}
                    className={`flex items-center gap-1.5 sm:gap-2 border rounded-full
                                px-2 sm:px-2.5 py-1.5 hover:bg-stone-50 transition-colors ml-0.5
                                min-h-[36px]
                                ${isLanding && !navOpaque
                        ? "border-white/30 hover:bg-white/10"
                        : "border-stone-200"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0
                                    bg-stone-200 flex items-center justify-center">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User profile picture"}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className={`text-[11px] font-medium
                                          ${isLanding && !navOpaque
                            ? "text-stone-700"
                            : "text-stone-600"
                          }`}>
                          {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Name — hidden on mobile */}
                    {!isLanding && (
                      <span className="hidden sm:block text-xs text-stone-700
                                       max-w-[80px] sm:max-w-[96px] truncate">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
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
                            {user.displayName || "Account"}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {isLanding && (
                          <button
                            onClick={() => {
                              navigate("/home");
                              setMenuOpen?.(false);
                            }}
                            className="w-full text-left text-xs text-stone-700 font-medium
                                       hover:bg-stone-50 px-4 py-2.5 transition-colors
                                       min-h-[36px]"
                          >
                            Go to Shop →
                          </button>
                        )}

                        <div className="border-t border-stone-100 mt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left text-xs text-stone-500 hover:bg-stone-50
                                       px-4 py-2.5 transition-colors min-h-[36px]"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              ) : (
                /* ── Logged OUT ── */
                <div className="flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1">
                  {/* "Sign In" text link — hidden on mobile */}
                  <button
                    onClick={() => navigate(user ? "/home" : "/auth")}
                    className={`hidden sm:block text-sm px-3 sm:px-4 py-2 transition-colors
                                 ${isLanding && !navOpaque
                        ? "text-white/80 hover:text-white"
                        : "text-stone-600 hover:text-stone-900"
                      }`}
                  >
                    Sign In
                  </button>
                  {/* Primary CTA */}
                  <button
                    onClick={() => navigate(user ? "/home" : "/auth")}
                    className={`text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full
                                 transition-colors min-h-[36px]
                                 ${isLanding && !navOpaque
                        ? "bg-white text-stone-900 hover:bg-stone-100"
                        : "bg-stone-900 text-white hover:bg-stone-700"
                      }`}
                  >
                    {isLanding ? "Get Started" : "Sign In"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}