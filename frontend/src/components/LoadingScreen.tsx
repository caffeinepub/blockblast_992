import React from "react";
import { useTheme, type ThemeId } from "../hooks/useTheme";

// Map theme IDs to spinner accent colors
const SPINNER_COLORS: Record<ThemeId, string> = {
  default: "#a855f7", // purple-500
  midnight: "#3b82f6", // blue-500
  sunset: "#f97316", // orange-500
  forest: "#10b981", // emerald-500
};

export const LoadingScreen: React.FC = () => {
  const { theme, themeId } = useTheme();
  const spinnerColor = SPINNER_COLORS[themeId];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.background} flex flex-col items-center justify-center`}
    >
      {/* Subtle radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.accentGlow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: "4px solid rgba(255, 255, 255, 0.2)",
            borderTopColor: spinnerColor,
          }}
        />

        {/* Loading text */}
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
};
