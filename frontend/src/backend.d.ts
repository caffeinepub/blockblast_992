import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Achievement {
    id: string;
    unlockedAt: Time;
}
export type Time = bigint;
export interface DailyChallenge {
    completedAt?: Time;
    targetScore: bigint;
    date: string;
    completed: boolean;
}
export interface PlayerStats {
    lastPlayed: Time;
    totalGamesPlayed: bigint;
    highScore: bigint;
    totalBlocksPlaced: bigint;
    totalLinesCleared: bigint;
}
export interface GameScore {
    principal: Principal;
    score: bigint;
    timestamp: Time;
}
export interface backendInterface {
    /**
     * / Complete today's daily challenge
     */
    completeDailyChallenge(): Promise<boolean>;
    /**
     * / Get player's achievements
     */
    getAchievements(): Promise<Array<Achievement>>;
    /**
     * / Get today's daily challenge for the player
     */
    getDailyChallenge(): Promise<DailyChallenge | null>;
    /**
     * / Get the player's high score
     */
    getHighScore(): Promise<bigint>;
    /**
     * / Get player's rank on the leaderboard (1-indexed, 0 if not on board)
     */
    getPlayerRank(): Promise<bigint>;
    /**
     * / Get the current player's stats
     */
    getPlayerStats(): Promise<PlayerStats>;
    /**
     * / Get top scores from the global leaderboard
     */
    getTopScores(limit: bigint): Promise<Array<GameScore>>;
    /**
     * / Get the current player's username (returns null if not registered)
     */
    getUsername(): Promise<string | null>;
    /**
     * / Get username for any principal (for leaderboard display)
     */
    getUsernameByPrincipal(principal: Principal): Promise<string | null>;
    /**
     * / Returns a greeting message
     */
    greet(name: string): Promise<string>;
    /**
     * / Health check function
     */
    health(): Promise<boolean>;
    /**
     * / Set today's daily challenge (called when loading game)
     */
    initDailyChallenge(date: string, targetScore: bigint): Promise<DailyChallenge>;
    /**
     * / Check if a username is already taken
     */
    isUsernameTaken(username: string): Promise<boolean>;
    /**
     * / Register a username for the current player
     */
    registerUsername(username: string): Promise<boolean>;
    /**
     * / Submit a new score to the leaderboard
     */
    submitScore(score: bigint): Promise<void>;
    /**
     * / Unlock an achievement for the player
     */
    unlockAchievement(achievementId: string): Promise<boolean>;
    /**
     * / Update player stats after a game
     */
    updateStats(linesCleared: bigint, blocksPlaced: bigint, score: bigint): Promise<PlayerStats>;
    /**
     * / Returns the caller's principal
     */
    whoami(): Promise<Principal>;
}
