// Block Blast - Game Over Overlay Component
import { Trophy, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export interface GameOverOverlayProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function GameOverOverlay({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}: GameOverOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  // Stagger content appearance
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Animate score counting up
  useEffect(() => {
    if (showContent && score > 0) {
      const duration = 1000;
      const steps = 30;
      const stepValue = score / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += stepValue;
        setDisplayScore(Math.round(current));

        if (step >= steps) {
          clearInterval(interval);
          setDisplayScore(score);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [showContent, score]);

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-500 p-4">
      <div
        className={`
          bg-gradient-to-br from-indigo-800/90 to-purple-900/90
          backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8
          shadow-2xl max-w-sm w-full text-center
          transition-all duration-500
          ${showContent ? "scale-100 opacity-100" : "scale-90 opacity-0"}
          ${isNewHighScore ? "animate-celebration-pulse" : ""}
        `}
      >
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Game Over
        </h2>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <div
            className={`
              inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300
              px-4 py-2 rounded-full mb-4 border border-yellow-500/30
              transition-all duration-500 delay-300
              ${showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"}
            `}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">New High Score!</span>
            <Trophy className="w-5 h-5" />
          </div>
        )}

        {/* Score Display */}
        <div className="mb-4 sm:mb-6">
          <div
            className={`
              text-4xl sm:text-5xl font-bold text-white mb-2
              ${isNewHighScore ? "text-yellow-300" : ""}
            `}
          >
            {displayScore.toLocaleString()}
          </div>
          <div className="text-sm sm:text-base text-white/60">
            {isNewHighScore ? (
              <span>You beat your previous best!</span>
            ) : (
              <span>Best: {highScore.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className={`
            flex items-center justify-center gap-2
            w-full py-4 px-6
            bg-gradient-to-r from-purple-500 to-pink-500
            hover:from-purple-600 hover:to-pink-600
            text-white font-semibold text-lg
            rounded-xl
            transition-all duration-200 delay-500
            hover:scale-105 active:scale-95
            shadow-lg shadow-purple-500/30
            border border-white/20
            ${showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
      </div>
    </div>
  );
}
