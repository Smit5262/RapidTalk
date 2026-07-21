import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, Bell, CheckCheck, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useAcceptWorkspaceInvite,
  useDeclineNotification,
} from "./useNotifications";
import { useNotificationStore } from "@/store/notification.store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import type { Notification, WorkspaceInvitePayload, MentionPayload } from "@/types/notification.types";

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const acceptInvite = useAcceptWorkspaceInvite();
  const decline = useDeclineNotification();
  const isPending = markRead.isPending || acceptInvite.isPending || decline.isPending;

  function handleClick() {
    if (notification.isRead) return;

    if (notification.type === "WORKSPACE_INVITE") return;

    if (notification.type === "MENTION") {
      const payload = notification.payload as unknown as MentionPayload;
      markRead.mutate(notification.id);
      navigate(`/w/${payload.workspaceId}/c/${payload.channelId}`);
      return;
    }

    markRead.mutate(notification.id);
  }

  if (notification.type === "WORKSPACE_INVITE") {
    const payload = notification.payload as unknown as WorkspaceInvitePayload;
    return (
      <div className="flex w-full gap-3 border-b border-border px-3 py-3 last:border-b-0">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <UserPlus size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm">
            <span className="font-medium">{payload.invitedByName}</span> invited you to{" "}
            <span className="font-medium">{payload.workspaceName}</span>
          </p>
          {!notification.isRead && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => acceptInvite.mutate(notification.id)}
                className="shrink-0"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => decline.mutate(notification.id)}
                className="shrink-0"
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (notification.type === "MENTION") {
    const payload = notification.payload as unknown as MentionPayload;
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex w-full gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/50",
          !notification.isRead && "bg-primary/[0.04]"
        )}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <AtSign size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-medium">{payload.mentionedByName}</span> mentioned you
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {payload.content}
          </p>
        </div>
        {!notification.isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/50",
        !notification.isRead && "bg-primary/[0.04]"
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Bell size={15} />
      </span>
      <p className="text-sm text-muted-foreground">
        {notification.type.replace(/_/g, " ").toLowerCase()} notification
      </p>
    </button>
  );
}

export function NotificationCenter({ align = "left" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.notifications) {
      const count = data.notifications.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }
  }, [data, setUnreadCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-md p-1.5 text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          open && "bg-accent text-accent-foreground"
        )}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-bold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "glass-strong absolute top-full z-30 mt-1 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border/80 shadow-xl",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent px-3 py-2.5">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto gap-1 px-1.5 py-0.5"
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck size={12} />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-8 text-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent inline-block" />
                </div>
              ) : !data?.notifications.length ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                </div>
              ) : (
                data.notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}