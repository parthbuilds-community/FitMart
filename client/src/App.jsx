// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminRoute from "./components/AdminRoute";
import NonAdminRoute from "./components/NonAdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import DevAdminLogin from "./components/DevAdminLogin";
import PageLoader from "./components/PageLoader";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Authentication = lazy(() => import("./pages/Authentication"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Payment = lazy(() => import("./pages/PaymentPage"));
const ProductConfirmation = lazy(() => import("./pages/ProductConfirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminInventory = lazy(() => import("./pages/AdminInventory"));
const Profile = lazy(() => import("./pages/Profile"));
const WeightLossPlans = lazy(() => import("./pages/WeightLossPlans"));
const MuscleBuildingPlans = lazy(() => import("./pages/MuscleBuildingPlans"));
const MobilityRecoveryPlans = lazy(() => import("./pages/MobilityRecoveryPlans"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/AdminCustomerDetail"));
const AdminMarketing = lazy(() => import("./pages/AdminMarketing"));
const AdminBugs = lazy(() => import("./pages/AdminBugs"));
const WorkoutNotes = lazy(() => import("./pages/NotesPage"));
const WorkoutTracker = lazy(() => import("./pages/TrackerPage"));
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const LegalTerms = lazy(() => import("./pages/LegalTerms"));
const LegalPrivacy = lazy(() => import("./pages/LegalPrivacy"));

export default function App() {
  const queryClient = new QueryClient();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
              {import.meta.env.MODE === 'development' && (
                <Route path="/dev-login" element={<DevAdminLogin />} />
              )}
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
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}