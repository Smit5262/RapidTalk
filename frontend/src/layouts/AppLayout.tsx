import { Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/useAuth";
import { WorkspaceSwitcher } from "@/features/workspaces/WorkspaceSwitcher";
import { ChannelList } from "@/features/channels/ChannelList";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-border bg-muted/30 p-3">
        <div className="mb-3">
          <WorkspaceSwitcher />
        </div>

        <div className="flex-1 overflow-y-auto">
          {workspaceId ? (
            <ChannelList workspaceId={workspaceId} />
          ) : (
            <p className="px-2 text-sm text-muted-foreground">
              Pick or create a workspace to see its channels.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
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