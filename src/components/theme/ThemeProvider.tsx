"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Mode = "light" | "dark";

type ThemeContextValue = {
  mode: Mode;
  toggle: () => void;
  colors: {
    gold: string;
    bg: string;
    text: string;
    subtext: string;
    border: string;
    surface: string;
  };
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("ui_mode");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = mode;
      window.localStorage.setItem("ui_mode", mode);
    }
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => {
    const gold = "#d4af37";
    if (mode === "dark") {
      return {
        mode,
        toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
        colors: {
          gold,
          bg: "#0b0b0b",
          text: "#ffffff",
          subtext: "#cbd5e1",
          border: "rgba(212,175,55,0.25)",
          surface: "#141414",
        },
      };
    }
    return {
      mode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      colors: {
        gold,
        bg: "#ffffff",
        text: "#0b0b0b",
        subtext: "#334155",
        border: "rgba(212,175,55,0.35)",
        surface: "#f8fafc",
      },
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}


