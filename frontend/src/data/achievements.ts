// Block Blast - Achievement Definitions

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon:
    | "trophy"
    | "star"
    | "zap"
    | "flame"
    | "target"
    | "crown"
    | "medal"
    | "sparkles";
}

// All available achievements
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Score-based achievements
  {
    id: "first-hundred",
    name: "Century",
    description: "Score 100 points in a single game",
    icon: "star",
  },
  {
    id: "high-scorer",
    name: "High Scorer",
    description: "Score 500 points in a single game",
    icon: "trophy",
  },
  {
    id: "score-master",
    name: "Score Master",
    description: "Score 1,000 points in a single game",
    icon: "crown",
  },
  {
    id: "legendary",
    name: "Legendary",
    description: "Score 2,500 points in a single game",
    icon: "sparkles",
  },

  // Line-clearing achievements
  {
    id: "first-clear",
    name: "First Clear",
    description: "Clear your first line",
    icon: "zap",
  },
  {
    id: "line-hunter",
    name: "Line Hunter",
    description: "Clear 10 lines in a single game",
    icon: "target",
  },
  {
    id: "line-master",
    name: "Line Master",
    description: "Clear 25 lines in a single game",
    icon: "medal",
  },

  // Combo achievements
  {
    id: "combo-starter",
    name: "Combo Starter",
    description: "Get a 2x combo",
    icon: "zap",
  },
  {
    id: "combo-king",
    name: "Combo King",
    description: "Get a 5x combo",
    icon: "flame",
  },
  {
    id: "combo-legend",
    name: "Combo Legend",
    description: "Get a 10x combo",
    icon: "crown",
  },

  // Games played achievements
  {
    id: "newcomer",
    name: "Newcomer",
    description: "Play your first game",
    icon: "star",
  },
  {
    id: "regular",
    name: "Regular",
    description: "Play 10 games",
    icon: "medal",
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Play 50 games",
    icon: "trophy",
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Play 100 games",
    icon: "crown",
  },

  // Block placement achievements
  {
    id: "block-placer",
    name: "Block Placer",
    description: "Place 100 blocks total",
    icon: "target",
  },
  {
    id: "block-master",
    name: "Block Master",
    description: "Place 500 blocks total",
    icon: "medal",
  },
];

// Achievement checking criteria
export interface GameSessionData {
  score: number;
  linesCleared: number;
  blocksPlaced: number;
  maxCombo: number;
}

export interface PlayerTotalStats {
  totalGamesPlayed: number;
  totalLinesCleared: number;
  totalBlocksPlaced: number;
  highScore: number;
}

// Check which achievements should be unlocked based on session data
export function checkSessionAchievements(session: GameSessionData): string[] {
  const unlocked: string[] = [];

  // Score achievements
  if (session.score >= 100) unlocked.push("first-hundred");
  if (session.score >= 500) unlocked.push("high-scorer");
  if (session.score >= 1000) unlocked.push("score-master");
  if (session.score >= 2500) unlocked.push("legendary");

  // Line clearing achievements (session)
  if (session.linesCleared >= 1) unlocked.push("first-clear");
  if (session.linesCleared >= 10) unlocked.push("line-hunter");
  if (session.linesCleared >= 25) unlocked.push("line-master");

  // Combo achievements
  if (session.maxCombo >= 2) unlocked.push("combo-starter");
  if (session.maxCombo >= 5) unlocked.push("combo-king");
  if (session.maxCombo >= 10) unlocked.push("combo-legend");

  return unlocked;
}

// Check which achievements should be unlocked based on total stats
export function checkTotalStatsAchievements(stats: PlayerTotalStats): string[] {
  const unlocked: string[] = [];

  // Games played achievements
  if (stats.totalGamesPlayed >= 1) unlocked.push("newcomer");
  if (stats.totalGamesPlayed >= 10) unlocked.push("regular");
  if (stats.totalGamesPlayed >= 50) unlocked.push("veteran");
  if (stats.totalGamesPlayed >= 100) unlocked.push("dedicated");

  // Block placement achievements
  if (stats.totalBlocksPlaced >= 100) unlocked.push("block-placer");
  if (stats.totalBlocksPlaced >= 500) unlocked.push("block-master");

  return unlocked;
}

// Get achievement definition by ID
export function getAchievementById(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
