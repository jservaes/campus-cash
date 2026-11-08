
import { useEffect, useState } from "react";
import { themes, type ThemeName } from "./themes";

const STORAGE_KEY = "campus-cash-theme";

function getInitialTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored && stored in themes) {
    return stored as ThemeName;
  }

  return "blush";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    const colors = themes[theme];
    const root = document.documentElement;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-surface", colors.surface);
    root.style.setProperty("--color-text", colors.text);

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
