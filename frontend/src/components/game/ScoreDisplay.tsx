// Block Blast - Score Display Component
import { Trophy, Star, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export interface ScoreDisplayProps {
  score: number;
  highScore: number;
  comboCount?: number;
}

export function ScoreDisplay({
  score,
  highScore,
  comboCount = 0,
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const prevScoreRef = useRef(score);
  const prevComboRef = useRef(comboCount);

  // Animate score counter when it changes
  useEffect(() => {
    if (score !== prevScoreRef.current) {
      setIsAnimating(true);

      // Smoothly increment the display score
      const diff = score - prevScoreRef.current;
      const steps = Math.min(20, Math.abs(diff));
      const stepValue = diff / steps;
      let current = prevScoreRef.current;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += stepValue;
        setDisplayScore(Math.round(current));

        if (step >= steps) {
          clearInterval(interval);
          setDisplayScore(score);
          setIsAnimating(false);
        }
      }, 20);

      prevScoreRef.current = score;
      return () => clearInterval(interval);
    }
  }, [score]);

  // Animate combo appearance
  useEffect(() => {
    if (comboCount > 1 && comboCount !== prevComboRef.current) {
      setShowCombo(false);
      // Small delay then show with animation
      const timer = setTimeout(() => setShowCombo(true), 50);
      prevComboRef.current = comboCount;
      return () => clearTimeout(timer);
    } else if (comboCount <= 1) {
      setShowCombo(false);
      prevComboRef.current = comboCount;
    }
  }, [comboCount]);

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Current Score */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">
          Score
        </span>
        <span
          className={`text-2xl sm:text-3xl font-bold text-white transition-transform ${
            isAnimating ? "animate-score-bump" : ""
          }`}
        >
          {displayScore.toLocaleString()}
        </span>
        {comboCount > 1 && (
          <span
            className={`text-[10px] sm:text-xs font-medium text-orange-400 flex items-center gap-1 ${
              showCombo ? "animate-combo-burst" : "opacity-0"
            }`}
          >
            <Zap className="w-3 h-3" />
            {comboCount}x Combo!
          </span>
        )}
      </div>

      {/* High Score */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide flex items-center gap-1">
          <Trophy className="w-3 h-3 text-yellow-400" />
          Best
        </span>
        <span className="text-lg sm:text-xl font-semibold text-white/80">
          {highScore.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
