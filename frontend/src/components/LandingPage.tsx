import React from "react";
import { MenuBackground } from "./menu/MenuBackground";
import { GameLogo } from "./menu/GameLogo";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  isLoggingIn,
}) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-4 sm:px-6 w-full max-w-sm">
        {/* Game Logo */}
        <GameLogo />

        {/* Login Button */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full px-6 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-bold text-base sm:text-lg rounded-xl
                       hover:from-purple-600 hover:to-pink-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg hover:shadow-xl hover:scale-105
                       border-2 border-white/20"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              "Sign in with Internet Identity"
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-white/50 text-center">
          Sign in to save your progress and compete on leaderboards
        </p>
      </div>
    </div>
  );
};
