import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspaces } from "./useWorkspaces";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/shared/lib/cn";

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = workspaces?.find((w) => w.id === currentWorkspaceId);

  function select(workspaceId: string) {
    setCurrentWorkspace(workspaceId);
    setDropdownOpen(false);
    navigate(`/w/${workspaceId}`);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  if (isLoading) {
    return <div className="h-8 animate-pulse rounded-lg bg-sidebar-accent" />;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors",
          "hover:bg-sidebar-accent",
          dropdownOpen && "bg-sidebar-accent"
        )}
      >
        <Avatar name={current?.name ?? "?"} size="sm" />
        <span className="flex-1 truncate">{current?.name ?? "Select workspace"}</span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200",
            dropdownOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="glass-strong absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-border/80 shadow-lg"
          >
            <div className="p-1">
              {workspaces?.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-sm text-muted-foreground">No workspaces yet.</p>
                </div>
              )}
              {workspaces?.map((w) => (
                <button
                  key={w.id}
                  onClick={() => select(w.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent",
                    w.id === currentWorkspaceId && "bg-accent"
                  )}
                >
                  <Avatar name={w.name} size="sm" />
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.id === currentWorkspaceId && (
                    <Check size={14} className="shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-primary transition-colors hover:bg-accent"
              >
                <Plus size={14} /> Create workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateWorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={select} />
    </div>
  );
}
