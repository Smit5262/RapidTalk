import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailX } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAcceptInvite } from "@/features/workspaces/useWorkspaces";
import { setPendingInvite, clearPendingInvite } from "@/utils/pendingInvite";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const acceptInvite = useAcceptInvite();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    clearPendingInvite();

    acceptInvite.mutate(token, {
      onSuccess: (data) => {
        navigate(`/w/${data.workspaceId}`, { replace: true });
      },
      onError: () => {
        setError(true);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    if (token) setPendingInvite(token);
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className="app-bg flex min-h-dvh items-center justify-center px-4">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -right-[20%] h-[800px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative w-full max-w-sm rounded-2xl border border-border/80 p-8 text-center shadow-xl"
          role="alert"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <MailX size={22} aria-hidden />
          </div>
          <h1 className="mb-2 text-lg font-semibold tracking-tight">Invite unavailable</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This invite link is invalid or has expired. Ask a workspace admin to send you a new one.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button className="w-full" onClick={() => navigate("/", { replace: true })}>
              Go to home
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/login", { replace: true })}>
              Back to login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-bg flex min-h-dvh items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        role="status"
        className="flex items-center gap-3 text-sm text-muted-foreground"
      >
        <Spinner size="sm" />
        Joining workspace...
      </motion.div>
    </div>
  );
}
