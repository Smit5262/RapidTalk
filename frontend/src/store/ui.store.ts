import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("rt-theme") as Theme) || "system";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initialTheme = getInitialTheme();
const initialResolved = initialTheme === "system" ? getSystemTheme() : initialTheme;
applyTheme(initialResolved);

export const useUIStore = create<UIState>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme) => {
    localStorage.setItem("rt-theme", theme);
    const resolved = theme === "system" ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));

if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const { theme } = useUIStore.getState();
    if (theme === "system") {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useUIStore.setState({ resolvedTheme: resolved });
    }
  });
}
