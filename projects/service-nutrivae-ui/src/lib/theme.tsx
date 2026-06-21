import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const storageKey = "nutrivae-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  const value = useMemo<ThemeContextValue>(() => {
    const setTheme = (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light")
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
