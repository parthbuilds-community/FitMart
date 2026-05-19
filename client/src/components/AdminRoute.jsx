import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "n5LtrXIGVSVjNktRn1PgDXZbHgq1";
const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.uid !== ADMIN_UID && user.uid !== SUPER_ADMIN_UID) return <Navigate to="/home" replace />;
  return children;
}
