// Block Blast - Game State Management Hook
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  type GameState,
  type Block,
  type Position,
  type Line,
  GRID_SIZE,
} from "../types/game";
import {
  createEmptyGrid,
  canPlaceBlock,
  processPlacement,
  checkGameOver,
} from "../game/gameLogic";
import {
  generateTray,
  markBlockUsed,
  isTrayEmpty,
} from "../game/blockGenerator";
import {
  useHighScore,
  useUpdateStats,
  useSubmitScore,
  useUnlockAchievement,
  useAchievements,
  usePlayerStats,
  useDailyChallenge,
  useCompleteDailyChallenge,
} from "./useQueries";
import {
  checkSessionAchievements,
  checkTotalStatsAchievements,
} from "../data/achievements";

// Local storage key for high score
const HIGH_SCORE_KEY = "blockblast_highscore";

// Action types
type GameAction =
  | { type: "PLACE_BLOCK"; block: Block; position: Position }
  | { type: "RESTART_GAME" }
  | { type: "SET_HIGH_SCORE"; score: number }
  | { type: "CLEAR_LINES_ANIMATION_DONE" }
  | { type: "SYNC_HIGH_SCORE"; remoteScore: number };

// Game session stats (for tracking within a single game)
interface GameSessionStats {
  blocksPlaced: number;
  linesCleared: number;
  maxCombo: number;
}

// Extended state to track session stats
interface ExtendedGameState extends GameState {
  sessionStats: GameSessionStats;
}

// Initial state creator
function createInitialState(highScore: number = 0): ExtendedGameState {
  const tray = generateTray();
  return {
    grid: createEmptyGrid(GRID_SIZE, GRID_SIZE),
    score: 0,
    highScore,
    tray,
    gameOver: false,
    lastLinesCleared: [],
    comboCount: 0,
    sessionStats: {
      blocksPlaced: 0,
      linesCleared: 0,
      maxCombo: 0,
    },
  };
}

// Game reducer
function gameReducer(
  state: ExtendedGameState,
  action: GameAction,
): ExtendedGameState {
  switch (action.type) {
    case "PLACE_BLOCK": {
      const { block, position } = action;

      // Validate placement
      if (!canPlaceBlock(state.grid, block, position)) {
        return state;
      }

      // Process the placement
      const hadPreviousLines = state.lastLinesCleared.length > 0;
      const result = processPlacement(
        state.grid,
        block,
        position,
        hadPreviousLines,
      );

      // Update tray
      let newTray = markBlockUsed(state.tray, block.id);

      // If tray is empty, generate new blocks
      if (isTrayEmpty(newTray)) {
        newTray = generateTray();
      }

      // Calculate new score and update high score
      const newScore = state.score + result.pointsEarned;
      const newHighScore = Math.max(state.highScore, newScore);

      // Check for game over
      const isGameOver = checkGameOver(result.newGrid, newTray);

      // Update combo count
      const newComboCount =
        result.linesCleared.length > 0 ? state.comboCount + 1 : 0;

      // Update session stats
      const newSessionStats: GameSessionStats = {
        blocksPlaced: state.sessionStats.blocksPlaced + 1,
        linesCleared:
          state.sessionStats.linesCleared + result.linesCleared.length,
        maxCombo: Math.max(state.sessionStats.maxCombo, newComboCount),
      };

      return {
        ...state,
        grid: result.newGrid,
        score: newScore,
        highScore: newHighScore,
        tray: newTray,
        gameOver: isGameOver,
        lastLinesCleared: result.linesCleared,
        comboCount: newComboCount,
        sessionStats: newSessionStats,
      };
    }

    case "RESTART_GAME": {
      const newTray = generateTray();
      return {
        grid: createEmptyGrid(GRID_SIZE, GRID_SIZE),
        score: 0,
        highScore: state.highScore, // Keep high score
        tray: newTray,
        gameOver: false,
        lastLinesCleared: [],
        comboCount: 0,
        sessionStats: {
          blocksPlaced: 0,
          linesCleared: 0,
          maxCombo: 0,
        },
      };
    }

    case "SET_HIGH_SCORE": {
      return {
        ...state,
        highScore: action.score,
      };
    }

    case "SYNC_HIGH_SCORE": {
      // Merge local and remote high scores - take the higher one
      const mergedHighScore = Math.max(state.highScore, action.remoteScore);
      return {
        ...state,
        highScore: mergedHighScore,
      };
    }

    case "CLEAR_LINES_ANIMATION_DONE": {
      return {
        ...state,
        lastLinesCleared: [],
      };
    }

    default:
      return state;
  }
}

// Load high score from localStorage
function loadHighScore(): number {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) {
      const score = parseInt(stored, 10);
      return isNaN(score) ? 0 : score;
    }
  } catch {
    // Ignore localStorage errors
  }
  return 0;
}

// Save high score to localStorage
function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export interface UseGameStateReturn {
  // State
  grid: GameState["grid"];
  score: number;
  highScore: number;
  tray: GameState["tray"];
  gameOver: boolean;
  lastLinesCleared: Line[];
  comboCount: number;

  // Actions
  placeBlock: (block: Block, position: Position) => boolean;
  restartGame: () => void;
  canPlaceBlockAt: (block: Block, position: Position) => boolean;
  clearLinesAnimationDone: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [state, dispatch] = useReducer(
    gameReducer,
    loadHighScore(),
    createInitialState,
  );

  // Backend integration hooks
  const { data: remoteHighScore, isSuccess: highScoreLoaded } = useHighScore();
  const updateStatsMutation = useUpdateStats();
  const submitScoreMutation = useSubmitScore();
  const unlockAchievementMutation = useUnlockAchievement();
  const { data: existingAchievements } = useAchievements();
  const { data: playerStats } = usePlayerStats();
  const { data: dailyChallenge } = useDailyChallenge();
  const completeDailyChallengeMutation = useCompleteDailyChallenge();

  // Track if we've synced with backend
  const hasSyncedRef = useRef(false);
  // Track previous game over state to detect transitions
  const prevGameOverRef = useRef(false);
  // Track session stats at game over for submission
  const sessionStatsAtGameOverRef = useRef<GameSessionStats | null>(null);

  // Sync high score with backend when loaded
  useEffect(() => {
    if (
      highScoreLoaded &&
      remoteHighScore !== undefined &&
      !hasSyncedRef.current
    ) {
      const remoteScore = Number(remoteHighScore);
      if (remoteScore > 0 || state.highScore > 0) {
        dispatch({ type: "SYNC_HIGH_SCORE", remoteScore });
        hasSyncedRef.current = true;
      }
    }
  }, [highScoreLoaded, remoteHighScore, state.highScore]);

  // Persist high score when it changes (to localStorage)
  useEffect(() => {
    saveHighScore(state.highScore);
  }, [state.highScore]);

  // Keep refs to mutation functions to avoid dependency issues
  const updateStatsMutateRef = useRef(updateStatsMutation.mutate);
  const submitScoreMutateRef = useRef(submitScoreMutation.mutate);
  const unlockAchievementMutateRef = useRef(unlockAchievementMutation.mutate);
  const completeDailyChallengeMutateRef = useRef(
    completeDailyChallengeMutation.mutate,
  );
  useEffect(() => {
    updateStatsMutateRef.current = updateStatsMutation.mutate;
    submitScoreMutateRef.current = submitScoreMutation.mutate;
    unlockAchievementMutateRef.current = unlockAchievementMutation.mutate;
    completeDailyChallengeMutateRef.current =
      completeDailyChallengeMutation.mutate;
  }, [
    updateStatsMutation.mutate,
    submitScoreMutation.mutate,
    unlockAchievementMutation.mutate,
    completeDailyChallengeMutation.mutate,
  ]);

  // Submit score and stats to backend when game ends
  useEffect(() => {
    // Detect game over transition (false -> true)
    if (state.gameOver && !prevGameOverRef.current) {
      // Store session stats at the moment of game over
      sessionStatsAtGameOverRef.current = { ...state.sessionStats };

      // Submit final score to leaderboard
      if (state.score > 0) {
        submitScoreMutateRef.current(state.score);
      }

      // Update player stats - always call even if score is 0 to track games played
      updateStatsMutateRef.current({
        linesCleared: state.sessionStats.linesCleared,
        blocksPlaced: state.sessionStats.blocksPlaced,
        score: state.score,
      });

      // Check and unlock session-based achievements
      const existingIds = new Set(existingAchievements?.map((a) => a.id) ?? []);
      const sessionAchievements = checkSessionAchievements({
        score: state.score,
        linesCleared: state.sessionStats.linesCleared,
        blocksPlaced: state.sessionStats.blocksPlaced,
        maxCombo: state.sessionStats.maxCombo,
      });

      // Unlock session achievements that aren't already unlocked
      for (const achievementId of sessionAchievements) {
        if (!existingIds.has(achievementId)) {
          unlockAchievementMutateRef.current(achievementId);
        }
      }

      // Check total stats achievements (using current stats + this session)
      if (playerStats) {
        const updatedTotalStats = {
          totalGamesPlayed: Number(playerStats.totalGamesPlayed) + 1,
          totalLinesCleared:
            Number(playerStats.totalLinesCleared) +
            state.sessionStats.linesCleared,
          totalBlocksPlaced:
            Number(playerStats.totalBlocksPlaced) +
            state.sessionStats.blocksPlaced,
          highScore: Math.max(Number(playerStats.highScore), state.score),
        };

        const totalAchievements =
          checkTotalStatsAchievements(updatedTotalStats);
        for (const achievementId of totalAchievements) {
          if (!existingIds.has(achievementId)) {
            unlockAchievementMutateRef.current(achievementId);
          }
        }
      }

      // Check and complete daily challenge if score meets target
      if (
        dailyChallenge &&
        !dailyChallenge.completed &&
        state.score >= Number(dailyChallenge.targetScore)
      ) {
        completeDailyChallengeMutateRef.current();
      }
    }

    prevGameOverRef.current = state.gameOver;
  }, [
    state.gameOver,
    state.score,
    state.sessionStats,
    existingAchievements,
    playerStats,
    dailyChallenge,
  ]);

  const placeBlock = useCallback(
    (block: Block, position: Position): boolean => {
      if (!canPlaceBlock(state.grid, block, position)) {
        return false;
      }
      dispatch({ type: "PLACE_BLOCK", block, position });
      return true;
    },
    [state.grid],
  );

  const restartGame = useCallback(() => {
    dispatch({ type: "RESTART_GAME" });
  }, []);

  const canPlaceBlockAt = useCallback(
    (block: Block, position: Position): boolean => {
      return canPlaceBlock(state.grid, block, position);
    },
    [state.grid],
  );

  const clearLinesAnimationDone = useCallback(() => {
    dispatch({ type: "CLEAR_LINES_ANIMATION_DONE" });
  }, []);

  return {
    grid: state.grid,
    score: state.score,
    highScore: state.highScore,
    tray: state.tray,
    gameOver: state.gameOver,
    lastLinesCleared: state.lastLinesCleared,
    comboCount: state.comboCount,
    placeBlock,
    restartGame,
    canPlaceBlockAt,
    clearLinesAnimationDone,
  };
}
