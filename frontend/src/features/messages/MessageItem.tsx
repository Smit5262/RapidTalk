import { useState } from "react";
import { Pencil, Smile, Trash2, MoreHorizontal, Languages, PenTool, ListTodo, ExternalLink, Check, X } from "lucide-react";
import type { Message, Attachment } from "@/types/message.types";
import { useAuthStore } from "@/store/auth.store";
import { useDeleteMessage, useEditMessage, useToggleReaction } from "./useMessages";
import { useTranslateMessage, useRewriteMessage, useExtractActionItems } from "@/features/ai/useAI";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";


const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "👀"];

function AttachmentView({ attachment }: { attachment: Attachment }) {
  if (attachment.mimeType.startsWith("image/")) {
    return (
      <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className="max-h-48 rounded-lg border border-border object-cover transition-opacity hover:opacity-90"
          loading="lazy"
        />
      </a>
    );
  }

  if (attachment.mimeType === "application/pdf") {
    return (
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 text-red-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{attachment.fileName}</p>
        </div>
        <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{attachment.fileName}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {attachment.sizeBytes < 1024 * 1024
          ? `${(attachment.sizeBytes / 1024).toFixed(0)} KB`
          : `${(attachment.sizeBytes / (1024 * 1024)).toFixed(1)} MB`}
      </span>
      <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
    </a>
  );
}

interface Props {
  message: Message;
  workspaceId: string;
  channelId: string;
}

export function MessageItem({ message, workspaceId, channelId }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwn = message.authorId === currentUserId;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [showPicker, setShowPicker] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const editMessage = useEditMessage(workspaceId, channelId);
  const deleteMessage = useDeleteMessage(workspaceId, channelId);
  const toggleReaction = useToggleReaction(workspaceId, channelId);

  const translate = useTranslateMessage(workspaceId, channelId);
  const rewrite = useRewriteMessage(workspaceId, channelId);
  const extractTasks = useExtractActionItems(workspaceId, channelId);

  const [aiResult, setAiResult] = useState<string | null>(null);

  const grouped = message.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  async function saveEdit() {
    if (draft.trim() && draft !== message.content) {
      await editMessage.mutateAsync({ messageId: message.id, content: draft.trim() });
    }
    setEditing(false);
  }

  async function handleTranslate(lang: string) {
    setShowMore(false);
    try {
      const result = await translate.mutateAsync({ content: message.content, targetLanguage: lang });
      setAiResult(result);
    } catch {}
  }

  async function handleRewrite(tone: "professional" | "casual" | "concise") {
    setShowMore(false);
    try {
      const result = await rewrite.mutateAsync({ content: message.content, tone });
      setAiResult(result);
    } catch {}
  }

  async function handleExtractTasks() {
    setShowMore(false);
    try {
      const tasks = await extractTasks.mutateAsync(message.content);
      const formatted = tasks
        .map(
          (t: { title: string; assignee: string | null; dueDate: string | null }) =>
            `- [ ] ${t.title}${t.assignee ? ` (@${t.assignee})` : ""}${t.dueDate ? ` (due: ${t.dueDate})` : ""}`
        )
        .join("\n");
      setAiResult(formatted);
    } catch {}
  }

  return (
    <div className="group relative flex gap-3 px-4 py-1.5 transition-colors hover:bg-muted/40">
      <div className="mt-0.5 shrink-0">
        <Avatar
          name={message.author.name}
          src={message.author.avatarUrl}
          size="md"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{message.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {editing ? (
          <div className="mt-1.5 flex gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-[3px] focus:ring-primary/20"
            />
            <Button size="icon-xs" onClick={saveEdit}>
              <Check size={14} />
            </Button>
            <Button size="icon-xs" variant="ghost" onClick={() => setEditing(false)}>
              <X size={14} />
            </Button>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {message.attachments?.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {message.attachments.map((a) => (
              <AttachmentView key={a.id} attachment={a} />
            ))}
          </div>
        )}

        {aiResult && (
          <div className="mt-2.5 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-primary">AI Result</span>
              <button
                onClick={() => setAiResult(null)}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiResult}</p>
          </div>
        )}

        {Object.keys(grouped).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(grouped).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() =>
                  toggleReaction.mutate({ messageId: message.id, emoji })
                }
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons - floating toolbar on hover */}
      <div className="absolute -top-3.5 right-3 z-10 flex items-center gap-0.5 rounded-lg border border-border bg-popover/95 p-0.5 opacity-0 shadow-md backdrop-blur-sm transition-all duration-150 group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowPicker((v) => !v)}
          aria-label="Add reaction"
        >
          <Smile size={14} />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowMore((v) => !v)}
            aria-label="More options"
          >
            <MoreHorizontal size={14} />
          </Button>

          {showMore && (
            <div className="absolute right-0 top-7 z-20 w-48 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-lg animate-fade-in-down">
              <button
                onClick={() => handleTranslate("Spanish")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <Languages size={14} className="text-muted-foreground" /> Translate
              </button>
              <button
                onClick={() => handleRewrite("professional")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <PenTool size={14} className="text-muted-foreground" /> Rewrite (pro)
              </button>
              <button
                onClick={() => handleRewrite("casual")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <PenTool size={14} className="text-muted-foreground" /> Rewrite (casual)
              </button>
              <div className="my-0.5 h-px bg-border" />
              <button
                onClick={() => handleExtractTasks()}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <ListTodo size={14} className="text-muted-foreground" /> Extract tasks
              </button>
            </div>
          )}
        </div>

        {isOwn && (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setEditing(true)}
              aria-label="Edit message"
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => deleteMessage.mutate(message.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete message"
            >
              <Trash2 size={14} />
            </Button>
          </>
        )}

        {showPicker && (
          <div className="absolute right-0 top-7 z-20 flex gap-0.5 rounded-xl border border-border bg-popover p-1.5 shadow-lg animate-fade-in-down">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  toggleReaction.mutate({ messageId: message.id, emoji });
                  setShowPicker(false);
                }}
                className="rounded-md p-1.5 text-sm transition-colors hover:bg-accent"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
