import React, { useState, useCallback, useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUsername } from "../hooks/useQueries";
import { LogOut, Home } from "lucide-react";
import { GameScreen } from "./GameScreen";
import { MenuScreen } from "./MenuScreen";
import { StatsScreen } from "./StatsScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { DailyChallengeScreen } from "./DailyChallengeScreen";
import { SettingsScreen } from "./SettingsScreen";
import { HowToPlayScreen } from "./HowToPlayScreen";
import { ScreenTransition } from "./ScreenTransition";
import { ConfirmDialog } from "./ConfirmDialog";
import { type Screen } from "../types/navigation";
import { useTheme } from "../hooks/useTheme";
import { useSettings } from "../hooks/useSettings";
import {
  initMusic,
  playMusic,
  setMusicEnabled,
  handleUserInteraction,
} from "../audio/soundManager";

interface MainAppProps {
  onLogout: () => void;
}

type PendingAction = "home" | "logout" | null;

export const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const { identity } = useInternetIdentity();
  const { data: username } = useUsername();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [isGameActive, setIsGameActive] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // Initialize and control background music
  useEffect(() => {
    initMusic();

    // Listen for user interaction to enable audio (browser autoplay policy)
    const onInteraction = () => {
      handleUserInteraction();
      // Remove listeners after first interaction
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };

    document.addEventListener("click", onInteraction);
    document.addEventListener("keydown", onInteraction);
    document.addEventListener("touchstart", onInteraction);

    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, []);

  useEffect(() => {
    setMusicEnabled(settings.musicEnabled);
    if (settings.musicEnabled) {
      playMusic();
    }
  }, [settings.musicEnabled]);

  // Display username if available, otherwise show truncated principal
  const principalText = identity?.getPrincipal().toString() ?? "Unknown";
  const shortPrincipal =
    principalText.length > 20
      ? `${principalText.slice(0, 8)}...${principalText.slice(-8)}`
      : principalText;
  const displayName = username || shortPrincipal;

  // Handle navigation requests - show confirm if game is active
  const handleHomeClick = useCallback(() => {
    if (isGameActive) {
      setPendingAction("home");
    } else {
      setCurrentScreen("menu");
    }
  }, [isGameActive]);

  const handleLogoutClick = useCallback(() => {
    if (isGameActive) {
      setPendingAction("logout");
    } else {
      onLogout();
    }
  }, [isGameActive, onLogout]);

  const handleConfirm = useCallback(() => {
    if (pendingAction === "home") {
      setCurrentScreen("menu");
    } else if (pendingAction === "logout") {
      onLogout();
    }
    setPendingAction(null);
    setIsGameActive(false);
  }, [pendingAction, onLogout]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  // Menu screen - full screen without header
  if (currentScreen === "menu") {
    return (
      <MenuScreen
        onPlay={() => setCurrentScreen("game")}
        onStats={() => setCurrentScreen("stats")}
        onLeaderboard={() => setCurrentScreen("leaderboard")}
        onDailyChallenge={() => setCurrentScreen("dailyChallenge")}
        onSettings={() => setCurrentScreen("settings")}
        onHowToPlay={() => setCurrentScreen("howToPlay")}
      />
    );
  }

  // Stats screen - full screen without header
  if (currentScreen === "stats") {
    return (
      <ScreenTransition key="stats">
        <StatsScreen onBack={() => setCurrentScreen("menu")} />
      </ScreenTransition>
    );
  }

  // Leaderboard screen
  if (currentScreen === "leaderboard") {
    return (
      <ScreenTransition key="leaderboard">
        <LeaderboardScreen onBack={() => setCurrentScreen("menu")} />
      </ScreenTransition>
    );
  }

  // Daily Challenge screen
  if (currentScreen === "dailyChallenge") {
    return (
      <ScreenTransition key="dailyChallenge">
        <DailyChallengeScreen
          onBack={() => setCurrentScreen("menu")}
          onPlayChallenge={() => setCurrentScreen("game")}
        />
      </ScreenTransition>
    );
  }

  // Settings screen
  if (currentScreen === "settings") {
    return (
      <ScreenTransition key="settings">
        <SettingsScreen onBack={() => setCurrentScreen("menu")} />
      </ScreenTransition>
    );
  }

  // How to Play screen
  if (currentScreen === "howToPlay") {
    return (
      <ScreenTransition key="howToPlay">
        <HowToPlayScreen onBack={() => setCurrentScreen("menu")} />
      </ScreenTransition>
    );
  }

  // Game screen with header
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.background} flex flex-col`}
    >
      {/* Subtle radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.accentGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back to menu button */}
          <button
            onClick={handleHomeClick}
            className="p-2 text-white/60 hover:text-white
                       hover:bg-white/10 rounded-lg transition-colors"
            title="Back to menu"
          >
            <Home className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-white">Block Blast</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* User info - show username if available */}
          <span
            className={`text-xs ${username ? "text-white/60 font-medium" : "text-white/40 font-mono"}`}
          >
            {displayName}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogoutClick}
            className="p-2 text-white/60 hover:text-white
                       hover:bg-white/10 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Game content */}
      <main className="relative z-10 flex-1 overflow-hidden mt-3 sm:mt-4">
        <GameScreen onGameActiveChange={setIsGameActive} />
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={pendingAction !== null}
        title="Leave Game?"
        message="Your current game progress will be lost. Are you sure you want to leave?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
