import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/useAuth";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-border bg-muted/30 p-4">
        <div className="mb-6 text-lg font-semibold">RapidTalk</div>
        <div className="flex-1 text-sm text-muted-foreground">
          Workspaces &amp; channels land here in Phase 2.
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="truncate text-sm">{user?.name}</span>
          <button
            onClick={() => logout.mutate()}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}