import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./lib/auth";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { LeavePage } from "./pages/LeavePage";
import { PerformancePage } from "./pages/PerformancePage";
import { RecruitmentPage } from "./pages/RecruitmentPage";
import { AnalyticsPage, PayrollPage } from "./pages/PlaceholderPage";
import { Sprout } from "lucide-react";
import { SettingsPage } from "./pages/SettingsPage";
import { PayoutsPage } from "./pages/PayoutsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectsPage } from "./pages/ProjectsPage";

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-brand-900 text-butter">
        <Sprout className="animate-pulse" size={36} />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

function HomeRoute() {
  const { user } = useAuth();
  return user?.role === "EMPLOYEE" ? <Navigate to="/profile" replace /> : <DashboardPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route index element={<HomeRoute />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
