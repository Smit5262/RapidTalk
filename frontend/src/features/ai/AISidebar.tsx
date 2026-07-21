import { useState } from "react";
import { Sparkles, X, Loader2, Copy, Check, ArrowUpRight, Brain, MessageSquare, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useSummarizeChannel, useSuggestReplies, useGenerateMeetingNotes } from "./useAI";
import { Button } from "@/components/ui/Button";


interface Props {
  workspaceId: string;
  channelId: string;
  open: boolean;
  onClose: () => void;
  onInsertReply: (text: string) => void;
}

export function AISidebar({ workspaceId, channelId, open, onClose, onInsertReply }: Props) {
  const [summary, setSummary] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const summarize = useSummarizeChannel(workspaceId, channelId);
  const suggestReplies = useSuggestReplies(workspaceId, channelId);
  const meetingNotesMutation = useGenerateMeetingNotes(workspaceId, channelId);

  if (!open) return null;

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass fixed inset-y-0 right-0 z-40 flex h-full w-full max-w-sm shrink-0 flex-col border-l border-border shadow-xl lg:static lg:z-auto lg:w-80 lg:max-w-none lg:shadow-none"
      >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-sm shadow-primary/25">
            <Sparkles size={15} />
          </div>
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 p-4">
        {/* Summarize */}
        <section className="surface-card rounded-2xl border border-border/70 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <Brain size={14} />
            </div>
            <h3 className="text-sm font-medium">Summarize Channel</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Get an AI-generated summary of recent conversations.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              summarize.mutate(undefined, { onSuccess: (s) => setSummary(s) })
            }
            disabled={summarize.isPending}
          >
            {summarize.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Summarizing...
              </>
            ) : (
              "Summarize"
            )}
          </Button>
          {summary && (
            <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-1.5 flex justify-end">
                <button
                  onClick={() => handleCopy(summary, "summary")}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === "summary" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {summary}
              </p>
            </div>
          )}
        </section>

        {/* Suggest Replies */}
        <section className="surface-card rounded-2xl border border-border/70 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <MessageSquare size={14} />
            </div>
            <h3 className="text-sm font-medium">Suggest Replies</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Get AI-suggested replies for the latest messages.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              suggestReplies.mutate(undefined, {
                onSuccess: (s) => setSuggestions(s),
              })
            }
            disabled={suggestReplies.isPending}
          >
            {suggestReplies.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Suggest Replies"
            )}
          </Button>
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onInsertReply(s)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
                >
                  <span className="flex-1">{s}</span>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-muted-foreground"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Meeting Notes */}
        <section className="surface-card rounded-2xl border border-border/70 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
              <FileText size={14} />
            </div>
            <h3 className="text-sm font-medium">Meeting Notes</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Generate structured meeting notes from channel messages.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              meetingNotesMutation.mutate([], {
                onSuccess: (n) => setMeetingNotes(n),
              })
            }
            disabled={meetingNotesMutation.isPending}
          >
            {meetingNotesMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Notes"
            )}
          </Button>
          {meetingNotes && (
            <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-1.5 flex justify-end">
                <button
                  onClick={() => handleCopy(meetingNotes, "notes")}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === "notes" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {meetingNotes}
              </p>
            </div>
          )}
        </section>
      </div>
      </motion.div>
    </>
  );
}
