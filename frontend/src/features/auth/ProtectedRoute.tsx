import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";

export default function ProtectedRoute() {
  const { isAuthenticated, setSession } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setChecked(true);
      return;
    }

    api
      .post("/auth/refresh")
      .then(async ({ data }) => {
        const { accessToken } = data.data;
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSession(accessToken, me.data.data);
      })
      .catch(() => {
        // No valid session — redirect below.
      })
      .finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}