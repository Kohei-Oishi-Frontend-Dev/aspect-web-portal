import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import NavLayout from "./pages/navigation/NavLayout";
import BillingLayout from "./pages/billing/BillingLayout";
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/login/ForgotPassword";
import ChangePassword from "./pages/login/ChangePassword";
import NewJobLayout from "./pages/new_job/NewJobLayout";
import InvoiceLayout from "./pages/invoice/InvoiceLayout";
import SignUp from "./pages/signup/SignUp";
import ReportsLayout from "./pages/reports/ReportsLayout";
// 1. Make sure HomeLayout and WorkLayout are imported and not commented out
import HomeLayout from "./pages/home/HomeLayout";
import WorkLayout from "./pages/work/WorkLayout";
import LocationsLayout from "./pages/locations/LocationLayout";
import LegalLayout from "./pages/legal/LegalLayout";
import UsersLayout from "./pages/users/UserLayout";
import ProfileLayout from "./pages/profile/ProfileLayout";

// This higher-order component wraps your main pages
// with the navigation sidebar and header.
const withNavLayout = (Component: React.ComponentType) => {
  return (
    <NavLayout>
      <Component />
    </NavLayout>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes that don't have the navigation sidebar */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/change-password"
        element={
          <ChangePassword
            email="test-email@gmail.com"
            passwordUpdatedAt="2025 Aug 11"
          />
        }
      />

      {/* Protected routes that are wrapped with the navigation layout */}

      {/* 2. These routes are now enabled */}
      <Route path="/home" element={withNavLayout(HomeLayout)} />
      <Route path="/profile" element={withNavLayout(ProfileLayout)} />
      <Route path="/work" element={withNavLayout(WorkLayout)} />
      <Route path="/legal" element={withNavLayout(LegalLayout)} />
      <Route path="/new-job" element={withNavLayout(NewJobLayout)} />
      <Route path="/location" element={withNavLayout(LocationsLayout)} />
      <Route path="/billing" element={withNavLayout(BillingLayout)} />
      <Route path="/invoice" element={withNavLayout(InvoiceLayout)} />
      <Route path="/reports" element={withNavLayout(ReportsLayout)} />
      <Route path="/users" element={withNavLayout(UsersLayout)} />
      {/* This "catch-all" route redirects any unknown URL to the login page. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
