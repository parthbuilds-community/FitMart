import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  // Dev admin fallback: allow access if dev_token is present
  if (import.meta.env.MODE === 'development') {
    const hasDevToken = localStorage.getItem('dev_token');
    if (hasDevToken) return children;
  }

  // Check role from the database (set via UserProfile)
  if (user.role !== 'admin') return <Navigate to="/home" replace />;

  return children;
}
