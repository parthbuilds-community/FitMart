import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

/**
 * Admin routes are guarded by the Firebase custom claim `admin: true`.
 * The server enforces the same claim, so this only decides what to show.
 */
export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return children;
}
