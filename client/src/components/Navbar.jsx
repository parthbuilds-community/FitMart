import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";

export default function Navbar({
  variant = "landing",
  navOpaque = true,
  onSearchToggle,
  cartCount = 0,
  onCartOpen,
  menuOpen,
  setMenuOpen,
  onSignOut,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [localMenuOpen, setLocalMenuOpen] = useState(false);

  // Treat tracker and notes as limited nav routes (no "Track Fitness" option)
  const isLimitedNavRoute =
    location?.pathname === "/profile" ||
    location?.pathname === "/tracker" ||
    location?.pathname === "/notes";

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut(auth);
      navigate("/");
    }
    if (typeof setMenuOpen === "function") setMenuOpen(false);
    else setLocalMenuOpen(false);
  };

  const isLanding = variant === "landing";

  const handleNav = () => {
    if (isLanding) window.scrollTo({ top: 0, behavior: "smooth" });
    else navigate("/home");
  };

  const positionClass = isLanding
    ? "fixed top-0 left-0 right-0 z-[9999]"
    : "sticky top-0 z-[9999]";

  const bgClass = isLanding
    ? navOpaque
      ? "bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm"
      : "bg-transparent"
    : "bg-white border-b border-stone-200";

  const logoColor = isLanding && !navOpaque ? "text-white" : "text-stone-900";
  const iconColor =
    isLanding && !navOpaque ? "text-white/80 hover:text-white" : "text-stone-500 hover:text-stone-900";

  const effectiveMenuOpen = typeof setMenuOpen === "function" ? !!menuOpen : localMenuOpen;

  return (
    <nav className={`w-full ${positionClass} transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <span
          role="button"
          tabIndex={0}
          aria-label="FitMart – go to home"
          onClick={handleNav}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleNav();
          }}
          className={`font-['DM_Serif_Display'] text-lg sm:text-xl tracking-tight cursor-pointer transition-colors ${logoColor}`}
        >
          FitMart
        </span>

        {/* Right */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {onSearchToggle && (
            <button
              type="button"
              onClick={onSearchToggle}
              aria-label="Toggle search"
              className={`p-2 transition-colors min-w-10 min-h-10 flex items-center justify-center rounded-full ${iconColor}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
            </button>
          )}

          {onCartOpen && (
            <button
              type="button"
              onClick={onCartOpen}
              aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
              className={`relative p-2 transition-colors min-w-10 min-h-10 flex items-center justify-center rounded-full ${iconColor}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-stone-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold" aria-hidden>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Auth area */}
          {!authLoading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof setMenuOpen === "function") setMenuOpen(!menuOpen);
                      else setLocalMenuOpen((p) => !p);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (typeof setMenuOpen === "function") setMenuOpen(!menuOpen);
                        else setLocalMenuOpen((p) => !p);
                      }
                    }}
                    aria-expanded={effectiveMenuOpen}
                    aria-controls="user-dropdown-menu"
                    aria-label="User menu"
                    className={`flex items-center gap-1.5 sm:gap-2 border rounded-full px-2 sm:px-2.5 py-1.5 hover:bg-stone-50 transition-colors ml-0.5 min-h-9 ${isLanding && !navOpaque ? "border-white/30 hover:bg-white/10" : "border-stone-200"}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-stone-200 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof setMenuOpen === "function") setMenuOpen(!menuOpen);
                        else setLocalMenuOpen((p) => !p);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (typeof setMenuOpen === "function") setMenuOpen(!menuOpen);
                          else setLocalMenuOpen((p) => !p);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName ? `${user.displayName}'s avatar` : "User avatar"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className={`text-[11px] font-medium ${isLanding && !navOpaque ? "text-stone-700" : "text-stone-600"}`} aria-hidden>
                          {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                        </span>
                      )}
                    </div>
                    {!isLanding && <span className="hidden sm:block text-xs text-stone-700 max-w-20 sm:max-w-24 truncate">{user.displayName || user.email?.split("@")[0]}</span>}
                  </button>

                  {effectiveMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => { if (typeof setMenuOpen === "function") setMenuOpen(false); else setLocalMenuOpen(false); }} aria-hidden />
                      <div id="user-dropdown-menu" role="menu" className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50">
                        <div className="px-4 py-2.5 border-b border-stone-100">
                          <p className="text-xs font-medium text-stone-900 truncate">{user.displayName || "Account"}</p>
                          <p className="text-[10px] text-stone-400 truncate mt-0.5">{user.email}</p>
                        </div>

                        {isLimitedNavRoute ? (
                          <div className="border-t border-stone-100 mt-1">
                            <button role="menuitem" onClick={() => { navigate('/profile'); if (typeof setMenuOpen === 'function') setMenuOpen(false); else setLocalMenuOpen(false); }} className="w-full text-left text-xs text-stone-700 hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">View Profile</button>
                            <button role="menuitem" onClick={handleSignOut} className="w-full text-left text-xs text-stone-500 hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">Sign Out</button>
                          </div>
                        ) : (
                          <>
                            {isLanding && (
                              <button role="menuitem" onClick={() => { navigate('/home'); if (typeof setMenuOpen === 'function') setMenuOpen(false); else setLocalMenuOpen(false); }} className="w-full text-left text-xs text-stone-700 font-medium hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">Go to Shop →</button>
                            )}

                            <button role="menuitem" onClick={() => { navigate('/tracker'); if (typeof setMenuOpen === 'function') setMenuOpen(false); else setLocalMenuOpen(false); }} className="w-full text-left text-xs text-stone-700 font-medium hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">Track Fitness →</button>

                            <div className="border-t border-stone-100 mt-1">
                              <button role="menuitem" onClick={() => { navigate('/profile'); if (typeof setMenuOpen === 'function') setMenuOpen(false); else setLocalMenuOpen(false); }} className="w-full text-left text-xs text-stone-700 hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">View Profile</button>
                              <button role="menuitem" onClick={handleSignOut} className="w-full text-left text-xs text-stone-500 hover:bg-stone-50 px-4 py-2.5 transition-colors min-h-9">Sign Out</button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1">
                  <button onClick={() => navigate(user ? "/home" : "/auth")} className={`hidden sm:block text-sm px-3 sm:px-4 py-2 transition-colors ${isLanding && !navOpaque ? "text-white/80 hover:text-white" : "text-stone-600 hover:text-stone-900"}`}>Sign In</button>
                  <button onClick={() => navigate(user ? "/home" : "/auth")} className={`text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full transition-colors min-h-9 ${isLanding && !navOpaque ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-900 text-white hover:bg-stone-700"}`}>{isLanding ? "Get Started" : "Sign In"}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
