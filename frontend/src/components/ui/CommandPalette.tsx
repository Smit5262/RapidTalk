import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft, Hash, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaces } from "@/features/workspaces/useWorkspaces";
import { useChannels } from "@/features/channels/useChannels";
import { useWorkspaceStore } from "@/store/workspace.store";
import { cn } from "@/shared/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface CommandItem {
  label: string;
  group: "Workspaces" | "Channels";
  icon: typeof Hash;
  action: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { data: workspaces } = useWorkspaces();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: channels } = useChannels(currentWorkspaceId);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase().trim();
    const items: CommandItem[] = [];

    workspaces?.forEach((w) => {
      if (w.name.toLowerCase().includes(q)) {
        items.push({
          label: w.name,
          group: "Workspaces",
          icon: Building2,
          action: () => {
            navigate(`/w/${w.id}`);
            onClose();
          },
        });
      }
    });

    channels?.forEach((c) => {
      if (c.name.toLowerCase().includes(q)) {
        items.push({
          label: c.name,
          group: "Channels",
          icon: Hash,
          action: () => {
            navigate(`/w/${c.workspaceId}/c/${c.id}`);
            onClose();
          },
        });
      }
    });

    return items.slice(0, 12);
  }, [query, workspaces, channels, navigate, onClose]);

  // Preserve the grouped rendering while keeping a flat index for keyboard nav.
  const groups = useMemo(() => {
    const map = new Map<string, { item: CommandItem; index: number }[]>();
    results.forEach((item, index) => {
      const list = map.get(item.group) ?? [];
      list.push({ item, index });
      map.set(item.group, list);
    });
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(results.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        results[activeIndex]?.action();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[16vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search size={16} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workspaces and channels..."
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="command-list"
                aria-activedescendant={results.length ? `command-item-${activeIndex}` : undefined}
                autoComplete="off"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="pointer-events-none hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-2xs text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            </div>
            <div
              ref={listRef}
              id="command-list"
              role="listbox"
              className="scrollbar-thin max-h-[min(24rem,50vh)] overflow-y-auto p-1.5"
            >
              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                  <Search size={18} className="text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">No results found.</p>
                </div>
              ) : (
                groups.map(([groupName, entries]) => (
                  <div key={groupName} className="mb-1 last:mb-0">
                    <div className="px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {entries.map(({ item, index }) => {
                        const Icon = item.icon;
                        const isActive = index === activeIndex;
                        return (
                          <button
                            key={index}
                            id={`command-item-${index}`}
                            data-index={index}
                            role="option"
                            aria-selected={isActive}
                            onClick={item.action}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-accent/50"
                            )}
                          >
                            <Icon size={16} className="shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate text-left">{item.label}</span>
                            <CornerDownLeft
                              size={13}
                              className={cn(
                                "shrink-0 text-muted-foreground transition-opacity",
                                isActive ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-2xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
