import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { toast } from "sonner";

// Helper to get error message from unknown error
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// Helper hook to get principal string
export function usePrincipal(): string {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal().toString() ?? "anonymous";
}

// ==================== Types ====================

export interface PlayerStats {
  highScore: bigint;
  totalGamesPlayed: bigint;
  totalLinesCleared: bigint;
  totalBlocksPlaced: bigint;
  lastPlayed: bigint;
}

export interface GameScore {
  score: bigint;
  timestamp: bigint;
  principal: { toString(): string };
}

export interface Achievement {
  id: string;
  unlockedAt: bigint;
}

export interface DailyChallenge {
  date: string;
  targetScore: bigint;
  completed: boolean;
  completedAt?: bigint;
}

// Query keys factory
const queryKeys = {
  greeting: (name: string, principal: string) => ["greeting", name, principal],
  whoami: (principal: string) => ["whoami", principal],
  health: () => ["health"],
  username: (principal: string) => ["username", principal],
  usernameAvailable: (username: string) => ["usernameAvailable", username],
  playerStats: (principal: string) => ["playerStats", principal],
  highScore: (principal: string) => ["highScore", principal],
  leaderboard: (limit: number) => ["leaderboard", limit],
  playerRank: (principal: string) => ["playerRank", principal],
  achievements: (principal: string) => ["achievements", principal],
  dailyChallenge: (principal: string) => ["dailyChallenge", principal],
  playerData: (principal: string) => ["playerData", principal],
};

// ==================== Original Queries ====================

export function useGreeting(name: string) {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.greeting(name, principal),
    queryFn: async () => {
      if (!actor) return null;
      return await actor.greet(name);
    },
    enabled: !!actor && !!name,
    staleTime: Infinity,
  });
}

export function useWhoami() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.whoami(principal),
    queryFn: async () => {
      if (!actor) return null;
      return await actor.whoami();
    },
    enabled: !!actor,
    staleTime: Infinity,
  });
}

export function useHealth() {
  const { actor } = useActor();

  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: async () => {
      if (!actor) return false;
      return await actor.health();
    },
    enabled: !!actor,
  });
}

// ==================== Username Queries ====================

export function useUsername() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.username(principal),
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getUsername();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: Infinity, // Username doesn't change once set
  });
}

export function useIsUsernameTaken(username: string) {
  const { actor } = useActor();
  const [debouncedUsername, setDebouncedUsername] = useState(username);

  // Debounce username changes to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [username]);

  const query = useQuery({
    queryKey: queryKeys.usernameAvailable(debouncedUsername.toLowerCase()),
    queryFn: async () => {
      if (!actor || !debouncedUsername) return false;
      return await actor.isUsernameTaken(debouncedUsername);
    },
    enabled: !!actor && debouncedUsername.length >= 3,
    staleTime: 30000, // 30 seconds cache for availability checks
  });

  return {
    ...query,
    // Show as fetching while debouncing or during actual fetch
    isFetching: query.isFetching || username !== debouncedUsername,
  };
}

export function useRegisterUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not initialized");
      if (principal === "anonymous")
        throw new Error("Must be logged in to register username");
      return await actor.registerUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.username(principal),
      });
      toast.success("Username registered successfully!");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      console.error("Failed to register username:", message);
      // Extract the actual error message from the backend trap
      if (message.includes("Username already taken")) {
        toast.error("This username is already taken");
      } else if (message.includes("Username already registered")) {
        toast.error("You already have a username");
      } else if (message.includes("at least 3 characters")) {
        toast.error("Username must be at least 3 characters");
      } else if (message.includes("at most 20 characters")) {
        toast.error("Username must be at most 20 characters");
      } else if (message.includes("only contain letters")) {
        toast.error(
          "Username can only contain letters, numbers, and underscores",
        );
      } else {
        toast.error("Failed to register username");
      }
    },
  });
}

export function useUsernames(principals: string[]) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["usernames", principals.join(",")],
    queryFn: async (): Promise<Map<string, string | null>> => {
      if (!actor || principals.length === 0) return new Map();

      // Fetch all usernames in parallel
      const results = await Promise.all(
        principals.map(async (principal) => {
          try {
            // Create a Principal object from the string
            const { Principal } = await import("@icp-sdk/core/principal");
            const principalObj = Principal.fromText(principal);
            const username = await actor.getUsernameByPrincipal(principalObj);
            return [principal, username] as [string, string | null];
          } catch {
            return [principal, null] as [string, string | null];
          }
        }),
      );

      return new Map(results);
    },
    enabled: !!actor && principals.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
}

// ==================== Player Stats Queries ====================

export function usePlayerStats() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.playerStats(principal),
    queryFn: async () => {
      if (!actor) return null;
      return (await actor.getPlayerStats()) as PlayerStats;
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 30000, // 30 seconds
  });
}

export function useHighScore() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.highScore(principal),
    queryFn: async () => {
      if (!actor) return 0n;
      return (await actor.getHighScore()) as bigint;
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 30000,
  });
}

export function usePlayerRank() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.playerRank(principal),
    queryFn: async () => {
      if (!actor) return 0n;
      return (await actor.getPlayerRank()) as bigint;
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60000, // 1 minute
  });
}

// ==================== Leaderboard Queries ====================

export function useLeaderboard(limit: number = 20) {
  const { actor } = useActor();

  return useQuery({
    queryKey: queryKeys.leaderboard(limit),
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getTopScores(BigInt(limit))) as GameScore[];
    },
    enabled: !!actor,
    staleTime: 0, // Always consider stale - ensures fresh data on mount
    refetchOnMount: "always", // Always refetch when visiting leaderboard
  });
}

// ==================== Achievement Queries ====================

export function useAchievements() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.achievements(principal),
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getAchievements()) as Achievement[];
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60000,
  });
}

// ==================== Combined Player Data Query ====================

export interface PlayerData {
  stats: PlayerStats;
  rank: bigint;
  achievements: Achievement[];
}

/** Combined hook to fetch all player data in parallel */
export function usePlayerData() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.playerData(principal),
    queryFn: async (): Promise<PlayerData | null> => {
      if (!actor) return null;

      // Fetch all data in parallel
      const [stats, rank, achievements] = await Promise.all([
        actor.getPlayerStats() as Promise<PlayerStats>,
        actor.getPlayerRank() as Promise<bigint>,
        actor.getAchievements() as Promise<Achievement[]>,
      ]);

      return { stats, rank, achievements };
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 0, // Always consider stale - ensures fresh data on mount
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true,
  });
}

// ==================== Daily Challenge Queries ====================

export function useDailyChallenge() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: queryKeys.dailyChallenge(principal),
    queryFn: async () => {
      if (!actor) return null;
      return (await actor.getDailyChallenge()) as DailyChallenge | null;
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60000,
  });
}

// ==================== Mutations ====================

export interface UpdateStatsParams {
  linesCleared: number;
  blocksPlaced: number;
  score: number;
}

export function useUpdateStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (params: UpdateStatsParams) => {
      if (!actor) throw new Error("Actor not initialized");
      if (principal === "anonymous")
        throw new Error("Must be logged in to save stats");
      return (await actor.updateStats(
        BigInt(params.linesCleared),
        BigInt(params.blocksPlaced),
        BigInt(params.score),
      )) as PlayerStats;
    },
    onSuccess: async () => {
      // Invalidate all related queries and wait for them to refetch
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.playerStats(principal),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.highScore(principal),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.playerData(principal),
        }),
      ]);
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      console.error("Failed to update stats:", message);
      toast.error("Failed to save game stats");
    },
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (score: number) => {
      if (!actor) throw new Error("Actor not initialized");
      if (principal === "anonymous")
        throw new Error("Must be logged in to submit score");
      return await actor.submitScore(BigInt(score));
    },
    onSuccess: async () => {
      // Invalidate all related queries
      // Use exact: false for leaderboard to match all limit variations
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["leaderboard"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.playerRank(principal),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.playerData(principal),
        }),
      ]);
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      console.error("Failed to submit score:", message);
      toast.error("Failed to submit score to leaderboard");
    },
  });
}

export function useUnlockAchievement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (achievementId: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return (await actor.unlockAchievement(achievementId)) as boolean;
    },
    onSuccess: (unlocked: boolean, achievementId: string) => {
      if (unlocked) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.achievements(principal),
        });
        toast.success(`Achievement unlocked: ${achievementId}`);
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to unlock achievement:", getErrorMessage(error));
    },
  });
}

export function useInitDailyChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async (params: { date: string; targetScore: number }) => {
      if (!actor) throw new Error("Actor not initialized");
      return (await actor.initDailyChallenge(
        params.date,
        BigInt(params.targetScore),
      )) as DailyChallenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyChallenge(principal),
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to init daily challenge:", getErrorMessage(error));
    },
  });
}

export function useCompleteDailyChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principal = usePrincipal();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return (await actor.completeDailyChallenge()) as boolean;
    },
    onSuccess: (completed: boolean) => {
      if (completed) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dailyChallenge(principal),
        });
        toast.success("Daily challenge completed!");
      }
    },
    onError: (error: unknown) => {
      console.error(
        "Failed to complete daily challenge:",
        getErrorMessage(error),
      );
    },
  });
}
