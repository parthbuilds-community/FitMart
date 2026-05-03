import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ReportBugButton from "./ReportBugButton";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "n5LtrXIGVSVjNktRn1PgDXZbHgq1";

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

  if (user && user.uid === ADMIN_UID) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      {children}
      {!isMobile && <ReportBugButton />}
    </>
  );
}