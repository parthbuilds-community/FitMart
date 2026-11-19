// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import Checkout from "./pages/Checkout";
import Payment from "./pages/PaymentPage";
import ProductConfirmation from "./pages/ProductConfirmation";
import NotFound from "./pages/NotFound";
import AdminInventory from "./pages/AdminInventory";
import Profile from "./pages/Profile";
import AdminRoute from "./components/AdminRoute";
import WeightLossPlans from "./pages/WeightLossPlans";
import MuscleBuildingPlans from "./pages/MuscleBuildingPlans";
import MobilityRecoveryPlans from "./pages/MobilityRecoveryPlans";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCustomerDetail from "./pages/AdminCustomerDetail";
import AdminMarketing from "./pages/AdminMarketing";
import AdminBugs from "./pages/AdminBugs";
import NonAdminRoute from "./components/NonAdminRoute";
import WorkoutNotes from "./pages/NotesPage";
import WorkoutTracker from "./pages/TrackerPage";
import ExercisePage from "./pages/ExercisePage";
import ErrorBoundary from "./components/ErrorBoundary";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";

function DocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "FitMart";

    if (path.startsWith("/admin/")) {
      if (path === "/admin/dashboard") title = "Dashboard";
      else if (path === "/admin/inventory") title = "Inventory";
      else if (path.startsWith("/admin/customers/")) title = "Customer Details";
      else if (path === "/admin/customers") title = "Customers";
      else if (path === "/admin/reports") title = "Reports";
      else if (path === "/admin/marketing") title = "Marketing";
      else if (path === "/admin/bugs") title = "Bug Reports";
      title = `${title} - FitMart`;
    } else if (path === "/profile") {
      title = "Profile - FitMart";
    } else if (path === "/auth") {
      title = "Sign In - FitMart";
    }

    document.title = title;
  }, [location.pathname]);

  return null;
}

export default function App() {
  const queryClient = new QueryClient();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DocumentTitle />
          <Routes>
            {/* Public routes (redirect admin users to admin dashboard) */}
            <Route path="/" element={<NonAdminRoute><LandingPage /></NonAdminRoute>} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<NonAdminRoute><HomePage /></NonAdminRoute>} />
            <Route path="/product/:productId" element={<NonAdminRoute><ProductPage /></NonAdminRoute>} />
            <Route path="/checkout" element={<NonAdminRoute><Checkout /></NonAdminRoute>} />
            <Route path="/profile" element={<NonAdminRoute><Profile /></NonAdminRoute>} />
            <Route path="/payment" element={<NonAdminRoute><Payment /></NonAdminRoute>} />
            <Route path="/payment-confirmation" element={<NonAdminRoute><ProductConfirmation /></NonAdminRoute>} />
            <Route path="/plans/weight-loss" element={<WeightLossPlans />} />
            <Route path="/plans/muscle-building" element={<MuscleBuildingPlans />} />
            <Route path="/plans/mobility-recovery" element={<MobilityRecoveryPlans />} />
            <Route path="/tracker" element={<NonAdminRoute><WorkoutTracker /></NonAdminRoute>} />
            <Route path="/notes" element={<NonAdminRoute><WorkoutNotes /></NonAdminRoute>} />
            <Route path="/exercises" element={<NonAdminRoute><ExercisePage /></NonAdminRoute>} />
            <Route path="/terms" element={<NonAdminRoute><LegalTerms /></NonAdminRoute>} />
            <Route path="/privacy-policy" element={<NonAdminRoute><LegalPrivacy /></NonAdminRoute>} />

            {/* Admin routes (guarded) */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/marketing"
              element={
                <AdminRoute>
                  <AdminMarketing />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bugs"
              element={
                <AdminRoute>
                  <AdminBugs />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <AdminCustomers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers/:userId"
              element={
                <AdminRoute>
                  <AdminCustomerDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <AdminInventory />
                </AdminRoute>
              }
            />

            {/* Redirect unknown routes to NotFound */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}