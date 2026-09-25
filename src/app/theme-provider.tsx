"use client";

import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  if (typeof window === "undefined") return "dark";

  const savedMode = localStorage.getItem(STORAGE_KEY);
  return savedMode === "light" || savedMode === "dark" || savedMode === "system"
    ? savedMode
    : "dark";
}

function applyTheme(mode: ThemeMode, systemTheme: ResolvedTheme) {
  const resolvedTheme = mode === "system" ? systemTheme : mode;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.theme = mode;
  return resolvedTheme;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Mantiene idéntico el primer render del servidor y el navegador.
  // El tema guardado se restaura después de hidratar; el script del layout
  // ya aplica la clase visual para evitar un destello de tema incorrecto.
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const initializedRef = useRef(false);
  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    const savedMode = getSavedThemeMode();
    const currentSystemTheme = getSystemTheme();

    initializedRef.current = true;
    applyTheme(savedMode, currentSystemTheme);
    const restoreThemeTimer = window.setTimeout(() => {
      setModeState(savedMode);
      setSystemTheme(currentSystemTheme);
    }, 0);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => {
      window.clearTimeout(restoreThemeTimer);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;

    applyTheme(mode, systemTheme);
    localStorage.setItem(STORAGE_KEY, mode);
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
        <Toaster richColors theme={resolvedTheme} position="top-center" duration={4000} closeButton />
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
