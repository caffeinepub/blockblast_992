// Block Blast - Stats Screen Component
import {
  ArrowLeft,
  Trophy,
  Gamepad2,
  Grid3X3,
  Layers,
  Clock,
  Award,
  Star,
  Zap,
  Flame,
  Target,
  Crown,
  Medal,
  Sparkles,
  Lock,
} from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import { usePlayerData } from "../hooks/useQueries";
import {
  ACHIEVEMENTS,
  getAchievementById,
  type AchievementDefinition,
} from "../data/achievements";

const ACHIEVEMENT_ICONS = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  flame: Flame,
  target: Target,
  crown: Crown,
  medal: Medal,
  sparkles: Sparkles,
} as const;

interface StatsScreenProps {
  onBack: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div className="text-purple-400">{icon}</div>
        <span className="text-white/60 text-xs sm:text-sm">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
      {subtext && <div className="text-xs text-white/40 mt-1">{subtext}</div>}
    </div>
  );
}

function formatLastPlayed(timestamp: bigint): string {
  if (timestamp === 0n) return "Never";
  const date = new Date(Number(timestamp / 1_000_000n)); // Convert nanoseconds to ms
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function StatsScreen({ onBack }: StatsScreenProps) {
  const { data, isLoading } = usePlayerData();

  // Extract data with defaults
  const stats = data?.stats;
  const rank = data?.rank;
  const achievements = data?.achievements;

  // Check if player has actually played (totalGamesPlayed > 0)
  const hasPlayed = stats && Number(stats.totalGamesPlayed) > 0;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated background */}
      <MenuBackground />

      {/* Header */}
      <header className="relative z-10 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Back to menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">My Stats</h1>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-3 sm:px-4 pb-6 sm:pb-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/60">Loading stats...</div>
          </div>
        ) : !hasPlayed ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Gamepad2 className="w-16 h-16 text-white/20 mb-4" />
            <div className="text-white/60 mb-2">No stats yet</div>
            <div className="text-white/40 text-sm">
              Play your first game to see your stats!
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            {/* High Score & Rank Section */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-400" />
                <div>
                  <div className="text-white/60 text-xs sm:text-sm">
                    High Score
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {Number(stats.highScore).toLocaleString()}
                  </div>
                </div>
              </div>
              {rank !== undefined && rank > 0n && (
                <div className="flex items-center gap-2 text-yellow-300/80">
                  <Award className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">
                    Global Rank: #{Number(rank).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Gamepad2 className="w-5 h-5" />}
                label="Games Played"
                value={Number(stats.totalGamesPlayed).toLocaleString()}
              />
              <StatCard
                icon={<Layers className="w-5 h-5" />}
                label="Lines Cleared"
                value={Number(stats.totalLinesCleared).toLocaleString()}
              />
              <StatCard
                icon={<Grid3X3 className="w-5 h-5" />}
                label="Blocks Placed"
                value={Number(stats.totalBlocksPlaced).toLocaleString()}
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Last Played"
                value={formatLastPlayed(stats.lastPlayed)}
              />
            </div>

            {/* Average Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-white/60 text-sm mb-3">Averages</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-white">
                    {Math.round(
                      Number(stats.totalLinesCleared) /
                        Number(stats.totalGamesPlayed),
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-white/40">Lines per game</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-white">
                    {Math.round(
                      Number(stats.totalBlocksPlaced) /
                        Number(stats.totalGamesPlayed),
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-white/40">Blocks per game</div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-white/60 text-sm mb-3">
                Achievements ({achievements?.length ?? 0} /{" "}
                {ACHIEVEMENTS.length})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {ACHIEVEMENTS.map((def) => {
                  const unlocked = achievements?.find((a) => a.id === def.id);
                  const IconComponent = ACHIEVEMENT_ICONS[def.icon];

                  return (
                    <div
                      key={def.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border transition-all
                        ${
                          unlocked
                            ? "bg-purple-500/20 border-purple-500/30"
                            : "bg-white/5 border-white/10 opacity-50"
                        }
                      `}
                    >
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${unlocked ? "bg-purple-500/30" : "bg-white/10"}
                      `}
                      >
                        {unlocked ? (
                          <IconComponent className="w-4 h-4 text-purple-300" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${unlocked ? "text-white" : "text-white/50"}`}
                        >
                          {def.name}
                        </div>
                        <div className="text-xs text-white/40 truncate">
                          {def.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
