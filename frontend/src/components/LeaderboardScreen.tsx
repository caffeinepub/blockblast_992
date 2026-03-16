// Block Blast - Leaderboard Screen Component
import { useMemo } from "react";
import { ArrowLeft, Trophy, Medal, Crown, User } from "lucide-react";
import { MenuBackground } from "./menu/MenuBackground";
import {
  useLeaderboard,
  usePlayerRank,
  usePrincipal,
  useUsernames,
} from "../hooks/useQueries";

interface LeaderboardScreenProps {
  onBack: () => void;
}

function formatTimestamp(timestamp: bigint): string {
  if (timestamp === 0n) return "";
  const date = new Date(Number(timestamp / 1_000_000n));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return (
    <span className="w-5 text-center text-white/50 text-sm font-mono">
      {rank}
    </span>
  );
}

function getRankBackground(rank: number, isCurrentPlayer: boolean): string {
  if (isCurrentPlayer) return "bg-purple-500/30 border-purple-400/50";
  if (rank === 1) return "bg-yellow-500/20 border-yellow-500/30";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/20";
  if (rank === 3) return "bg-amber-600/10 border-amber-600/20";
  return "bg-white/5 border-white/10";
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { data: leaderboard, isLoading: isLeaderboardLoading } =
    useLeaderboard(20);
  const { data: playerRank } = usePlayerRank();
  const currentPrincipal = usePrincipal();

  // Extract principals from leaderboard for username lookup
  const principals = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.map((entry) => entry.principal.toString());
  }, [leaderboard]);

  // Fetch usernames for all leaderboard entries
  const { data: usernamesMap } = useUsernames(principals);

  const isLoading = isLeaderboardLoading;
  const hasData = leaderboard && leaderboard.length > 0;

  // Helper to get display name (username or truncated principal)
  const getDisplayName = (principal: string): string => {
    const username = usernamesMap?.get(principal);
    if (username) return username;
    return truncatePrincipal(principal);
  };

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
        <div className="flex items-center gap-2">
          <Trophy className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Leaderboard
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-3 sm:px-4 pb-6 sm:pb-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/60">Loading leaderboard...</div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Trophy className="w-16 h-16 text-white/20 mb-4" />
            <div className="text-white/60 mb-2">No scores yet</div>
            <div className="text-white/40 text-sm">
              Be the first to set a high score!
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            {/* Player's rank if not in top 20 */}
            {playerRank && Number(playerRank) > 20 && (
              <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 mb-6">
                <div className="flex items-center gap-2 text-purple-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    Your rank: #{Number(playerRank).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Leaderboard list */}
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentPlayer =
                  entry.principal.toString() === currentPrincipal;

                return (
                  <div
                    key={`${entry.principal.toString()}-${index}`}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm
                      transition-all duration-200
                      ${getRankBackground(rank, isCurrentPlayer)}
                      ${isCurrentPlayer ? "scale-[1.02]" : ""}
                    `}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm truncate ${
                            usernamesMap?.get(entry.principal.toString())
                              ? "font-semibold"
                              : "font-mono"
                          } ${isCurrentPlayer ? "text-purple-300" : "text-white/90"}`}
                        >
                          {getDisplayName(entry.principal.toString())}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-xs bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      {entry.timestamp > 0n && (
                        <div className="text-xs text-white/40 mt-0.5">
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div
                      className={`text-right ${rank <= 3 ? "text-xl font-bold" : "text-lg font-semibold"} ${
                        rank === 1
                          ? "text-yellow-400"
                          : rank === 2
                            ? "text-gray-300"
                            : rank === 3
                              ? "text-amber-500"
                              : isCurrentPlayer
                                ? "text-purple-300"
                                : "text-white"
                      }`}
                    >
                      {Number(entry.score).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="text-center text-white/30 text-xs mt-6">
              Top 20 global scores
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
