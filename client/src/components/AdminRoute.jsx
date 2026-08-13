import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "n5LtrXIGVSVjNktRn1PgDXZbHgq1";
const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';
const DEV_ADMIN_EMAIL = import.meta.env.VITE_DEV_ADMIN_EMAIL || '';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  // In development allow a local dev admin session
  // In development allow access only to the configured dev admin email
if (import.meta.env.MODE === "development") {
  const isDevLocal =
    localStorage.getItem("dev_token") &&
    DEV_ADMIN_EMAIL &&
    user?.email === DEV_ADMIN_EMAIL;

  if (isDevLocal) return children;
}

  if (user.uid !== ADMIN_UID && user.uid !== SUPER_ADMIN_UID) return <Navigate to="/home" replace />;
  return children;
}
