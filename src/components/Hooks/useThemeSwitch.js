"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const storageKey = "theme";
const preferDarkQuery = "(prefers-color-scheme: dark)";

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
  listeners.add(listener);
  const mediaQuery = window.matchMedia(preferDarkQuery);
  mediaQuery.addEventListener("change", notify);
  // Keep other tabs in step.
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(listener);
    mediaQuery.removeEventListener("change", notify);
    window.removeEventListener("storage", notify);
  };
};

// A stored choice wins; otherwise follow the system setting.
const getSnapshot = () => {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia(preferDarkQuery).matches ? "dark" : "light";
};

const getServerSnapshot = () => "dark";

export function useThemeSwitch() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // The inline script in the layout sets this class before paint; this keeps it
  // in step afterwards, including when the system preference changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const setMode = useCallback((theme) => {
    window.localStorage.setItem(storageKey, theme);
    notify();
  }, []);

  return [mode, setMode];
}
