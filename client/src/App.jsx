// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        // Public routes (redirect admin users to admin dashboard)
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

        // Redirect unknown routes to NotFound
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
