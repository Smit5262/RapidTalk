import { useRef, useState } from "react";
import { Paperclip, Send, X, Loader2, Check } from "lucide-react";
import { getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/auth.store";
import { useSendMessage } from "./useMessages";
import { uploadFileDirectly, presignUpload, type UploadProgress } from "@/services/uploadClient";
import { useWorkspaceMembers } from "@/features/workspaces/useWorkspaces";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";

interface Props {
  workspaceId: string;
  channelId: string;
}

interface PendingFile {
  file: File;
  progress: UploadProgress | null;
  uploading: boolean;
  attachment?: { fileUrl: string; fileName: string; mimeType: string; sizeBytes: number };
  error?: string;
}

const TYPING_STOP_DELAY_MS = 2000;

export function MessageComposer({ workspaceId, channelId }: Props) {
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const sendMessage = useSendMessage(workspaceId, channelId);
  const name = useAuthStore((s) => s.user?.name) ?? "Someone";
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const mentionableUsers =
    members
      ?.filter((m) => m.user)
      .map((m) => ({ id: m.userId, name: m.user!.name }))
      .filter((u) =>
        u.name.toLowerCase().includes(mentionQuery.toLowerCase())
      ) ?? [];

  function emitTyping(isTyping: boolean) {
    const socket = getSocket();
    if (!socket) return;
    isTypingRef.current = isTyping;
    socket.emit(isTyping ? "typing:start" : "typing:stop", {
      channelId,
      name,
    });
  }

  function handleChange(value: string) {
    setContent(value);

    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1 && lastAt === value.length - 1) {
      setShowMentions(true);
      setMentionQuery("");
    } else if (lastAt !== -1) {
      const afterAt = value.slice(lastAt + 1);
      if (!afterAt.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(afterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    if (!isTypingRef.current) emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () => emitTyping(false),
      TYPING_STOP_DELAY_MS
    );
  }

  function insertMention(userName: string) {
    const lastAt = content.lastIndexOf("@");
    const before = content.slice(0, lastAt);
    setContent(`${before}@${userName} `);
    setShowMentions(false);
    textareaRef.current?.focus();
  }

  async function uploadFile(file: File) {
    const idx = pendingFiles.length;
    setPendingFiles((prev) => [
      ...prev,
      { file, progress: null, uploading: true },
    ]);

    try {
      const presigned = await presignUpload(workspaceId, channelId, file);
      await uploadFileDirectly(presigned.url, file, (progress) => {
        setPendingFiles((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], progress };
          return next;
        });
      });

      const attachment = {
        fileUrl: presigned.fileUrl,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      };

      setPendingFiles((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], uploading: false, attachment };
        return next;
      });
    } catch {
      setPendingFiles((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          uploading: false,
          error: "Upload failed",
        };
        return next;
      });
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(uploadFile);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadFile(file);
        }
      }
    }
  }

  function removePendingFile(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed && pendingFiles.every((f) => !f.attachment)) return;

    setContent("");
    setPendingFiles([]);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTyping(false);

    const attachments = pendingFiles
      .filter((f) => f.attachment)
      .map((f) => f.attachment!);

    await sendMessage.mutateAsync({
      content: trimmed || " ",
      ...(attachments.length > 0 ? { attachments } : {}),
    });
  }

  const hasContent =
    content.trim() || pendingFiles.some((f) => f.attachment);

  return (
    <div
      className="glass shrink-0 border-t border-border px-4 py-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Mention autocomplete */}
      {showMentions && mentionableUsers.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-fade-in-down">
          {mentionableUsers.slice(0, 5).map((u) => (
            <button
              key={u.id}
              onClick={() => insertMention(u.name)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span className="font-medium">{u.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((pf, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs"
            >
              <span className="max-w-[120px] truncate font-medium">
                {pf.file.name}
              </span>
              {pf.uploading && pf.progress && (
                <div className="h-1 w-16 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pf.progress.percent}%` }}
                  />
                </div>
              )}
              {pf.uploading && !pf.progress && (
                <Loader2 size={12} className="animate-spin text-primary" />
              )}
              {pf.error && (
                <span className="text-destructive">{pf.error}</span>
              )}
              {pf.attachment && (
                <span className="text-success">
                  <Check size={12} />
                </span>
              )}
              <button
                onClick={() => removePendingFile(idx)}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer input */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-xs transition-all duration-150",
          "focus-within:border-primary focus-within:shadow-sm focus-within:ring-[3px] focus-within:ring-primary/20",
          "border-input hover:border-muted-foreground/30"
        )}
      >
        <label
          className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Attach file"
        >
          <Paperclip size={18} />
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv,.json,.mp4,.webm,.mov,.mp3,.ogg,.wav"
          />
        </label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message this channel..."
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button
          size="icon-sm"
          onClick={handleSend}
          disabled={!hasContent || sendMessage.isPending}
          className="shrink-0 rounded-xl transition-transform hover:scale-105 active:scale-95"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
