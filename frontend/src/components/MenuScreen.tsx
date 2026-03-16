// Block Blast - Main Menu Screen
import {
  Play,
  BarChart2,
  Trophy,
  Calendar,
  Settings,
  HelpCircle,
  Check,
  LogOut,
} from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import { GameLogo } from "./menu/GameLogo";
import { MenuButton } from "./menu/MenuButton";
import { useDailyChallenge, usePrincipal } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface MenuScreenProps {
  onPlay: () => void;
  onStats: () => void;
  onLeaderboard: () => void;
  onDailyChallenge: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
}

/** Main menu screen with animated background and Play button */
export function MenuScreen({
  onPlay,
  onStats,
  onLeaderboard,
  onDailyChallenge,
  onSettings,
  onHowToPlay,
}: MenuScreenProps) {
  const { data: dailyChallenge } = useDailyChallenge();
  const principal = usePrincipal();
  const { clear: logout, identity } = useInternetIdentity();
  const isLoggedIn = identity && !identity.getPrincipal().isAnonymous();

  // Truncate principal for display
  const shortPrincipal =
    principal && principal.length > 16
      ? `${principal.slice(0, 5)}...${principal.slice(-5)}`
      : principal;

  // Check daily challenge status for today
  const today = new Date().toISOString().split("T")[0];
  const isTodaysChallenge = dailyChallenge?.date === today;
  const hasIncompleteChallenge =
    isTodaysChallenge && !dailyChallenge?.completed;
  const hasCompletedChallenge = isTodaysChallenge && dailyChallenge?.completed;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-4 sm:px-6 w-full max-w-sm">
        {/* Game Logo */}
        <GameLogo />

        {/* Menu Options */}
        <div className="w-full flex flex-col gap-3 mt-6">
          <div className="animate-menu-item" style={{ animationDelay: "0.1s" }}>
            <MenuButton onClick={onPlay} icon={Play} variant="primary">
              Play
            </MenuButton>
          </div>

          {/* Daily Challenge with indicator */}
          <div
            className="relative animate-menu-item"
            style={{ animationDelay: "0.15s" }}
          >
            <MenuButton
              onClick={onDailyChallenge}
              icon={Calendar}
              variant="secondary"
            >
              Daily Challenge
            </MenuButton>
            {hasIncompleteChallenge && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            )}
            {hasCompletedChallenge && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="animate-menu-item" style={{ animationDelay: "0.2s" }}>
            <MenuButton
              onClick={onLeaderboard}
              icon={Trophy}
              variant="secondary"
            >
              Leaderboard
            </MenuButton>
          </div>

          <div
            className="animate-menu-item"
            style={{ animationDelay: "0.25s" }}
          >
            <MenuButton onClick={onStats} icon={BarChart2} variant="secondary">
              My Stats
            </MenuButton>
          </div>

          <div className="animate-menu-item" style={{ animationDelay: "0.3s" }}>
            <MenuButton
              onClick={onSettings}
              icon={Settings}
              variant="secondary"
            >
              Settings
            </MenuButton>
          </div>

          <div
            className="animate-menu-item"
            style={{ animationDelay: "0.35s" }}
          >
            <MenuButton
              onClick={onHowToPlay}
              icon={HelpCircle}
              variant="secondary"
            >
              How to Play
            </MenuButton>
          </div>

          {isLoggedIn && (
            <div
              className="animate-menu-item"
              style={{ animationDelay: "0.4s" }}
            >
              <MenuButton onClick={logout} icon={LogOut} variant="secondary">
                Logout
              </MenuButton>
            </div>
          )}
        </div>

        {/* Version and user indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className="text-white/30 text-xs font-mono">v1.0.0</div>
          {shortPrincipal && (
            <div className="text-white/20 text-[10px] font-mono mt-1">
              {shortPrincipal}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
