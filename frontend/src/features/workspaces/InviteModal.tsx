import { useState } from "react";
import { Copy, Check, Send, Link2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateInvite } from "./useWorkspaces";

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ workspaceId, open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const createInvite = useCreateInvite(workspaceId);

  const inviteLink =
    createInvite.data?.token
      ? `${window.location.origin}/invite/${createInvite.data.token}`
      : null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    createInvite.mutate(
      { email: email.trim(), expiresInDays: 7 },
      {
        onSuccess: () => {
          setEmailSent(true);
          setEmail("");
        },
      }
    );
  };

  const handleGenerate = () => {
    setCopied(false);
    createInvite.mutate({ expiresInDays: 7 });
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    createInvite.reset();
    setCopied(false);
    setEmailSent(false);
    setEmail("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite people" description="Send an invitation via email or share a link.">
      <form onSubmit={handleSendEmail} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailSent(false);
          }}
          placeholder="colleague@company.com"
          className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
        />
        <Button
          type="submit"
          disabled={createInvite.isPending || !email.trim()}
        >
          <Send size={14} />
          Send
        </Button>
      </form>

      {emailSent && (
        <div className="mt-3 rounded-lg bg-success/10 px-3 py-2.5">
          <p className="text-sm text-success">Invite sent successfully.</p>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link2 size={14} />
          <span>Or share an invite link</span>
        </div>

        {inviteLink ? (
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="h-10 flex-1 rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm outline-none"
            />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={handleGenerate}
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? "Generating..." : "Generate invite link"}
          </Button>
        )}
      </div>

      {createInvite.isError && (
        <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2.5">
          <p className="text-sm text-destructive">
            Could not send invite. Try again.
          </p>
        </div>
      )}
    </Modal>
  );
}
