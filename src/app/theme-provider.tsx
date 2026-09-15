"use client";

import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "agiliza-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSavedThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";

  const savedMode = localStorage.getItem(STORAGE_KEY);
  return savedMode === "light" || savedMode === "dark" || savedMode === "system"
    ? savedMode
    : "system";
}

function applyTheme(mode: ThemeMode, systemTheme: ResolvedTheme) {
  const resolvedTheme = mode === "system" ? systemTheme : mode;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.theme = mode;
  return resolvedTheme;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getSavedThemeMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => (
    typeof window === "undefined" ? "light" : getSystemTheme()
  ));
  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    applyTheme(mode, systemTheme);
    localStorage.setItem(STORAGE_KEY, mode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [mode, systemTheme]);

  const muiTheme = useMemo(
    () => createTheme({
      palette: {
        mode: resolvedTheme,
        background: resolvedTheme === "dark"
          ? { default: "#0b1120", paper: "#111827" }
          : { default: "#f8fafc", paper: "#ffffff" },
      },
      shape: { borderRadius: 10 },
    }),
    [resolvedTheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode: setModeState }),
    [mode, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
        <Toaster richColors theme={resolvedTheme} position="top-center" duration={2000} closeButton />
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme debe usarse dentro de AppThemeProvider.");
  }

  return context;
}
