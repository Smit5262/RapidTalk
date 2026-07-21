import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import HomePage from "@/pages/HomePage";
import WorkspacePage from "@/pages/WorkspacePage";
import ChannelPage from "@/pages/ChannelPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import { PageLoader } from "@/components/ui/Spinner";

// Code-split the dashboard so the heavy charting library stays out of the
// initial bundle and only loads when the dashboard is opened.
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

function RouteFallback() {
  return <PageLoader label="Loading" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invite/:token" element={<AcceptInvitePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/w/:workspaceId" element={<WorkspacePage />} />
            <Route path="/w/:workspaceId/c/:channelId" element={<ChannelPage />} />
            <Route
              path="/w/:workspaceId/dashboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}