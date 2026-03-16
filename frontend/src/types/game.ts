// Block Blast Game Types

/** Position on the grid */
export interface Position {
  row: number;
  col: number;
}

/** A single cell on the grid */
export interface Cell {
  filled: boolean;
  color: string | null;
}

/** Shape matrix - true means occupied */
export type ShapeMatrix = boolean[][];

/** Block definition */
export interface Block {
  id: string;
  shape: ShapeMatrix;
  color: string;
  name: string;
}

/** A block in the tray with its current state */
export interface TrayBlock {
  block: Block;
  used: boolean;
}

/** Line to be cleared (either row or column) */
export interface Line {
  type: "row" | "col";
  index: number;
}

/** Result of placing a block */
export interface PlacementResult {
  newGrid: Cell[][];
  linesCleared: Line[];
  pointsEarned: number;
  isCombo: boolean;
}

/** Game state */
export interface GameState {
  grid: Cell[][];
  score: number;
  highScore: number;
  tray: TrayBlock[];
  gameOver: boolean;
  lastLinesCleared: Line[];
  comboCount: number;
}

/** Drag state for tracking current drag operation */
export interface DragState {
  isDragging: boolean;
  block: Block | null;
  previewPosition: Position | null;
  canDrop: boolean;
}

/** Grid dimensions */
export const GRID_SIZE = 8;
export const TRAY_SIZE = 3;

/** Block colors palette */
export const BLOCK_COLORS = {
  red: "#EF4444",
  orange: "#F97316",
  yellow: "#EAB308",
  green: "#22C55E",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
} as const;

export type BlockColorName = keyof typeof BLOCK_COLORS;
