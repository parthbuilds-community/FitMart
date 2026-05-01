import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";
import PropTypes from "prop-types";

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
    isLanding && !navOpaque
      ? "text-white/80 hover:text-white"
      : "text-stone-500 hover:text-stone-900";

  const effectiveMenuOpen =
    typeof setMenuOpen === "function" ? !!menuOpen : localMenuOpen;

  return (
    <nav className={`w-full ${positionClass} transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
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

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {onSearchToggle && (
            <button
              type="button"
              onClick={onSearchToggle}
              aria-label="Toggle search"
              className={`p-2 transition-colors min-w-10 min-h-10 flex items-center justify-center rounded-full ${iconColor}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-stone-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

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
                    className="flex items-center gap-2 border rounded-full px-2 py-1.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">
                      {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate("/auth")}>Sign In</button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ✅ PropTypes added here */
Navbar.propTypes = {
  variant: PropTypes.string,
  navOpaque: PropTypes.bool,
  onSearchToggle: PropTypes.func,
  cartCount: PropTypes.number,
  onCartOpen: PropTypes.func,
  menuOpen: PropTypes.bool,
  setMenuOpen: PropTypes.func,
  onSignOut: PropTypes.func,
};