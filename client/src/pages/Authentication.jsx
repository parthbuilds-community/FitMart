// src/pages/Authentication.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../auth/firebase";
import { useGithubStats } from "../utils/useGithubStats";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;
const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';

const formatStat = (n, loading) => (loading ? "—" : Number(n).toLocaleString("en-IN"));

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
         0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
         1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338
         -2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65
         0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027
         2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566
         4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02
         0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export default function Authentication() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { stats: ghStats, loading: ghLoading } = useGithubStats();

  useEffect(() => { document.title = "Login - FitMart"; }, []);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Poll for email verification if waiting on pending-verification screen
  useEffect(() => {
    let pollInterval = null;
    if (mode === "pending-verification" && auth.currentUser) {
      pollInterval = setInterval(async () => {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified || auth.currentUser.uid === SUPER_ADMIN_UID) {
            clearInterval(pollInterval);
            navigate(auth.currentUser.uid === ADMIN_UID || auth.currentUser.uid === SUPER_ADMIN_UID ? "/admin/dashboard" : "/home");
          }
        } catch (err) {
          console.error("Failed to reload user:", err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [mode, navigate]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const parseError = (code) => {
    const map = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/invalid-credential": "Invalid email or password.",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      if (!cred.user.emailVerified && cred.user.uid !== SUPER_ADMIN_UID) {
        // Keep user signed in so resend can use auth.currentUser
        setError("");
        setMode("pending-verification");
        return;
      }
      navigate(cred?.user?.uid === ADMIN_UID || cred?.user?.uid === SUPER_ADMIN_UID ? "/admin/dashboard" : "/home");
    } catch (err) {
      setError(parseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (form.name.trim()) await updateProfile(cred.user, { displayName: form.name.trim() });
      await sendEmailVerification(cred.user);
      // Keep user signed in so resend can use auth.currentUser
      setResendDisabled(true);
      setResendTimer(60);
      setMode("pending-verification");
    } catch (err) {
      setError(parseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      navigate(cred?.user?.uid === ADMIN_UID || cred?.user?.uid === SUPER_ADMIN_UID ? "/admin/dashboard" : "/home");
    } catch (err) {
      setError(parseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendDisabled) return;
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        // Fallback: sign in if session was lost (e.g. page refresh)
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        await sendEmailVerification(cred.user);
      } else {
        await sendEmailVerification(user);
      }
      setResendDisabled(true);
      setResendTimer(60);
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Firebase is rate-limiting requests. Please wait a few minutes before trying again.");
        setResendDisabled(true);
        setResendTimer(120);
      } else {
        setError(parseError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!form.email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
    } catch (err) {
      setError(parseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    // Sign out when leaving pending-verification screen
    if (mode === "pending-verification" && m !== "pending-verification") {
      signOut(auth);
    }
    setMode(m);
    setError("");
    setResetSent(false);
    if (m !== "pending-verification") {
      setForm({ name: "", email: "", password: "", confirm: "" });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif] flex flex-col lg:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .auth-panel { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .auth-panel.visible { opacity: 1; transform: translateY(0); }
        .input-field { transition: border-color 0.2s ease; }
        .input-field:focus { outline: none; border-color: #1c1917; }
        .mode-tab { transition: color 0.2s ease, border-color 0.2s ease; }
      `}</style>

      {/* ── Left branding panel — hidden on mobile, visible lg+ ── */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-stone-900 p-12">
        <button
          onClick={() => navigate("/")}
          className="font-['DM_Serif_Display'] text-2xl text-white tracking-tight"
        >
          FitMart
        </button>

        <div>
          <h2 className="font-['DM_Serif_Display'] text-4xl xl:text-5xl text-white leading-tight mb-5">
            Your fitness ecosystem,{" "}
            <em className="not-italic text-stone-400">all in one place.</em>
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
            Equipment, nutrition, and digital coaching — curated for Mumbai's fitness community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { v: formatStat(ghStats.stars, ghLoading), l: "Github Stars" },
            { v: formatStat(ghStats.forks, ghLoading), l: "Forks" },
            { v: formatStat(ghStats.contributors, ghLoading), l: "Contributors" },
            { v: formatStat(ghStats.commits, ghLoading), l: "Commits" },
          ].map((s, i) => (
            <div key={i} className="bg-stone-800 rounded-xl p-4">
              <div className="font-['DM_Serif_Display'] text-2xl text-white">{s.v}</div>
              <div className="text-xs text-stone-500 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile top branding strip ── */}
      <div className="lg:hidden bg-stone-900 px-5 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="font-['DM_Serif_Display'] text-xl text-white"
        >
          FitMart
        </button>
        <a
          href="https://github.com/parthbuilds-community/FitMart"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-white border border-stone-600 px-3 py-1 rounded-md hover:border-white transition"
        >
          <GithubIcon />
          <span className="ml-1 text-sm">Star</span>
        </a>
      </div>

      {/* ── Right auth panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      px-5 sm:px-8 py-10 sm:py-12 min-h-0">
        <div className={`auth-panel ${visible ? "visible" : ""} w-full max-w-sm`}>

          {/* Mode Tabs */}
          {mode !== "reset" && mode !== "pending-verification" && (
            <div className="flex border-b border-stone-200 mb-6 sm:mb-8">
              {["signin", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`mode-tab flex-1 py-3 text-sm font-medium border-b-2 -mb-px
                              transition-all min-h-11
                              ${mode === m
                      ? "border-stone-900 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                    }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          {/* ── SIGN IN ── */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">
                  Email
                </label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="you@example.com"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-stone-500 tracking-wide uppercase">Password</label>
                  <button
                    type="button" onClick={() => switchMode("reset")}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors min-h-8 px-1"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} required placeholder="••••••••"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-stone-900 text-white text-sm py-3 rounded-lg
                           hover:bg-stone-700 transition-colors disabled:opacity-50 mt-1 min-h-12">
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">or</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <button type="button" onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-stone-200
                           bg-white text-stone-700 text-sm py-3 rounded-lg hover:bg-stone-50
                           transition-colors disabled:opacity-50 min-h-12">
                <GoogleIcon />
                Continue with Google
              </button>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">
                  Full Name
                </label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="Arjun Mehta"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="you@example.com"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} required placeholder="Minimum 6 characters"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">
                  Confirm Password
                </label>
                <input
                  type="password" name="confirm" value={form.confirm}
                  onChange={handleChange} required placeholder="••••••••"
                  className="input-field w-full border border-stone-200 bg-white rounded-lg
                             px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-stone-900 text-white text-sm py-3 rounded-lg
                           hover:bg-stone-700 transition-colors disabled:opacity-50 mt-1 min-h-12">
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">or</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <button type="button" onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-stone-200
                           bg-white text-stone-700 text-sm py-3 rounded-lg hover:bg-stone-50
                           transition-colors disabled:opacity-50 min-h-12">
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="underline cursor-pointer"
                >
                  Terms
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
                  className="underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </form>
          )}

          {/* ── RESET PASSWORD ── */}
          {mode === "reset" && (
            <div>
              <button
                onClick={() => switchMode("signin")}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600
                           transition-colors mb-6 min-h-9"
              >
                ← Back to Sign In
              </button>

              <h3 className="font-['DM_Serif_Display'] text-2xl text-stone-900 mb-2">
                Reset your password
              </h3>
              <p className="text-sm text-stone-500 mb-6 sm:mb-7 leading-relaxed">
                Enter your email and we'll send you a reset link.
              </p>

              {resetSent ? (
                <div className="bg-stone-100 border border-stone-200 rounded-xl px-5 py-5 text-center">
                  <p className="text-sm text-stone-700 font-medium mb-1">Check your inbox</p>
                  <p className="text-xs text-stone-500">
                    Reset link sent to <span className="font-medium">{form.email}</span>
                  </p>
                  <button
                    onClick={() => switchMode("signin")}
                    className="mt-4 text-xs text-stone-500 underline min-h-9"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">
                      Email
                    </label>
                    <input
                      type="email" name="email" value={form.email}
                      onChange={handleChange} required placeholder="you@example.com"
                      className="input-field w-full border border-stone-200 bg-white rounded-lg
                                 px-4 py-3 text-sm text-stone-900 placeholder-stone-300"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-stone-900 text-white text-sm py-3 rounded-lg
                               hover:bg-stone-700 transition-colors disabled:opacity-50 min-h-12">
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── PENDING VERIFICATION ── */}
          {mode === "pending-verification" && (
            <div>
              <button
                onClick={() => switchMode("signin")}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600
                           transition-colors mb-6 min-h-9"
              >
                ← Back to Sign In
              </button>

              <h3 className="font-['DM_Serif_Display'] text-2xl text-stone-900 mb-2">
                Verify your email
              </h3>
              <p className="text-sm text-stone-500 mb-6 sm:mb-7 leading-relaxed">
                We've sent a verification link to <span className="font-medium">{form.email}</span>.
                Please verify your email address to continue.
              </p>

              <div className="bg-stone-100 border border-stone-200 rounded-xl px-5 py-5 text-center">
                <p className="text-sm text-stone-700 font-medium mb-3">Didn't receive the email?</p>
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 text-left">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleResendVerification}
                  disabled={loading || resendDisabled}
                  className="w-full bg-stone-900 text-white text-sm py-3 rounded-lg
                             hover:bg-stone-700 transition-colors disabled:opacity-50 min-h-12"
                >
                  {loading ? "Sending..." : resendDisabled ? `Resend in ${resendTimer}s` : "Resend Verification Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}