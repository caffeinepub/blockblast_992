// Block Blast - Theme System
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemeId = "default" | "midnight" | "sunset" | "forest";

export interface Theme {
  id: ThemeId;
  name: string;
  background: string;
  accent: string;
  accentGlow: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    id: "default",
    name: "Cosmic Purple",
    background: "from-indigo-900 via-purple-900 to-slate-900",
    accent: "from-purple-500 to-indigo-500",
    accentGlow: "rgba(139, 92, 246, 0.15)",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Blue",
    background: "from-slate-900 via-blue-950 to-slate-900",
    accent: "from-blue-500 to-cyan-500",
    accentGlow: "rgba(59, 130, 246, 0.15)",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Orange",
    background: "from-slate-900 via-orange-950 to-red-950",
    accent: "from-orange-500 to-red-500",
    accentGlow: "rgba(249, 115, 22, 0.15)",
  },
  forest: {
    id: "forest",
    name: "Forest Green",
    background: "from-slate-900 via-emerald-950 to-teal-950",
    accent: "from-emerald-500 to-teal-500",
    accentGlow: "rgba(16, 185, 129, 0.15)",
  },
};

const THEME_STORAGE_KEY = "blockblast_theme";

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && stored in THEMES) {
      return stored as ThemeId;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "default";
}

function saveThemeId(id: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Ignore localStorage errors
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(loadThemeId);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    saveThemeId(id);
  };

  const theme = THEMES[themeId];

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
