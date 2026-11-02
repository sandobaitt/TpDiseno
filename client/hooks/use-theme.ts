import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, setStoredTheme, type Theme } from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return getInitialTheme();
  });

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (next: Theme) => {
    setThemeState(next);
  };

  return { theme, setTheme, toggleTheme };
}

/** Tema que tiene aplicado la página ahora (sigue los cambios de la clase .dark en <html>). */
export function useAppliedTheme(): Theme {
  const read = (): Theme =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
  const [applied, setApplied] = useState<Theme>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setApplied(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return applied;
}
