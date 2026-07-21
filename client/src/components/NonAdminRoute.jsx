import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ReportBugButton from "./ReportBugButton";

export default function NonAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (loading) return null;

  // Redirect admins away from non-admin pages
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      {children}
      {!isMobile && <ReportBugButton />}
    </>
  );
}