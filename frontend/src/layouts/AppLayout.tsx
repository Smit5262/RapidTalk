import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Menu, MessagesSquare, Search, UserPlus, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/useAuth";
import { WorkspaceSwitcher } from "@/features/workspaces/WorkspaceSwitcher";
import { InviteModal } from "@/features/workspaces/InviteModal";
import { useMyWorkspaceRole } from "@/features/workspaces/useWorkspaces";
import { ChannelList } from "@/features/channels/ChannelList";
import { NotificationCenter } from "@/features/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const role = useMyWorkspaceRole(workspaceId ?? null);
  const canInvite = role === "OWNER" || role === "ADMIN";

  useSocketConnection();
  useNotificationSocket();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const sidebar = (
    <div className="glass-sidebar flex h-full flex-col">
      {/* Workspace header */}
      <div className="flex h-14 items-center justify-between gap-1 border-b border-sidebar-border px-3">
        <div className="min-w-0 flex-1">
          <WorkspaceSwitcher />
        </div>
        <div className="flex items-center gap-0.5">
          {workspaceId && canInvite && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setInviteOpen(true)}
              aria-label="Invite people"
            >
              <UserPlus size={15} />
            </Button>
          )}
          {workspaceId && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigate(`/w/${workspaceId}/dashboard`)}
              aria-label="Dashboard"
            >
              <BarChart3 size={15} />
            </Button>
          )}
          <ThemeToggle />
          <NotificationCenter />
        </div>
      </div>

      {/* Quick search */}
      <div className="px-2 pt-2">
        <button
          onClick={() => setCmdOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-background/60 px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Search size={14} className="shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-2xs sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Channel list */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-2">
        {workspaceId ? (
          <ChannelList workspaceId={workspaceId} />
        ) : (
          <div className="px-3 py-8 text-center">
            <p className="text-balance text-sm text-muted-foreground">
              Pick or create a workspace to see its channels.
            </p>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent">
          <Avatar
            name={user?.name ?? "U"}
            src={user?.avatarUrl}
            size="sm"
            showOnline
            isOnline
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-2xs text-muted-foreground">Online</p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => logout.mutate()}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Log out"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H7.5C7.77614 2 8 2.22386 8 2.5V4H3.5C3.22386 4 3 3.77614 3 3.5V2.5ZM3 5H7V12.5C7 12.7761 6.77614 13 6.5 13H3.5C3.22386 13 3 12.7761 3 12.5V5ZM8 5H12.5C12.7761 5 13 5.22386 13 5.5V12.5C13 12.7761 12.7761 13 12.5 13H8V5ZM10 7.5C10 7.22386 9.77614 7 9.5 7C9.22386 7 9 7.22386 9 7.5V10.5C9 10.7761 9.22386 11 9.5 11C9.77614 11 10 10.7761 10 10.5V7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-sidebar-border lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-sidebar-border shadow-xl"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="glass flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </Button>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-primary-foreground shadow-sm shadow-primary/25">
            <MessagesSquare size={15} aria-hidden />
          </span>
          <span className="flex-1 truncate text-sm font-semibold">RapidTalk</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
          >
            <Search size={16} />
          </Button>
          <ThemeToggle />
          <NotificationCenter align="right" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="page-enter h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {workspaceId && (
        <InviteModal
          workspaceId={workspaceId}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
