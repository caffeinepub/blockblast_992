// Block Blast - Daily Challenge Screen Component
import { useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  Play,
  Sparkles,
} from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import { MenuButton } from "./menu/MenuButton";
import {
  useDailyChallenge,
  useInitDailyChallenge,
  useHighScore,
} from "../hooks/useQueries";

interface DailyChallengeScreenProps {
  onBack: () => void;
  onPlayChallenge: () => void;
}

// Generate today's date string in YYYY-MM-DD format
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Generate a deterministic target score based on the date
// This ensures all players get the same challenge each day
function generateTargetScore(dateString: string): number {
  // Simple hash based on date to create variety
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  // Target scores between 50 and 200 (reasonable for the game)
  const base = 50;
  const range = 150;
  return base + Math.abs(hash % range);
}

export function DailyChallengeScreen({
  onBack,
  onPlayChallenge,
}: DailyChallengeScreenProps) {
  const { data: challenge, isLoading: isChallengeLoading } =
    useDailyChallenge();
  const { data: highScore } = useHighScore();
  const initChallenge = useInitDailyChallenge();

  const today = getTodayDateString();
  const isToday = challenge?.date === today;
  const isCompleted = challenge?.completed ?? false;

  // Initialize today's challenge if needed
  useEffect(() => {
    if (!isChallengeLoading && (!challenge || !isToday)) {
      const targetScore = generateTargetScore(today);
      initChallenge.mutate({ date: today, targetScore });
    }
  }, [isChallengeLoading, challenge, isToday, today, initChallenge]);

  const isLoading = isChallengeLoading || initChallenge.isPending;

  // Calculate progress (as percentage towards target)
  const targetScore = challenge ? Number(challenge.targetScore) : 0;
  const currentHighScore = highScore ? Number(highScore) : 0;
  const progressPercent =
    targetScore > 0 ? Math.min(100, (currentHighScore / targetScore) * 100) : 0;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Back to menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 pb-8 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-white/60">Loading challenge...</div>
        ) : (
          <div className="max-w-sm w-full space-y-6">
            {/* Challenge Card */}
            <div
              className={`
              relative rounded-2xl p-6 border backdrop-blur-sm overflow-hidden
              ${
                isCompleted
                  ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                  : "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
              }
            `}
            >
              {/* Sparkles for completed state */}
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
                </div>
              )}

              {/* Date */}
              <div className="text-white/50 text-sm mb-4">
                {new Date(today).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* Status */}
              {isCompleted ? (
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-green-400 font-bold text-xl">
                      Completed!
                    </div>
                    <div className="text-white/50 text-sm">Great job today</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-orange-400" />
                  <div>
                    <div className="text-white/60 text-sm">Target Score</div>
                    <div className="text-4xl font-bold text-white">
                      {targetScore.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress bar (only show if not completed) */}
              {!isCompleted && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Your best today</span>
                    <span className="text-white font-semibold">
                      {currentHighScore.toLocaleString()} /{" "}
                      {targetScore.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-white/40">
                    {Math.round(progressPercent)}% complete
                  </div>
                </div>
              )}
            </div>

            {/* Play Button */}
            {!isCompleted && (
              <MenuButton
                onClick={onPlayChallenge}
                icon={Play}
                variant="primary"
              >
                Play Challenge
              </MenuButton>
            )}

            {/* Completed message */}
            {isCompleted && (
              <div className="text-center text-white/50 text-sm">
                Come back tomorrow for a new challenge!
              </div>
            )}

            {/* Tips */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-white/60 text-sm mb-2">Tips</h3>
              <ul className="text-white/40 text-sm space-y-1">
                <li>- Clear multiple lines at once for combo bonuses</li>
                <li>- Place smaller blocks first to save space</li>
                <li>- Plan ahead for line clears</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
