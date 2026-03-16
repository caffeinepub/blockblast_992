// Block Blast - Core Game Logic (Pure Functions)
import {
  type Cell,
  type Block,
  type Position,
  type Line,
  type PlacementResult,
  type TrayBlock,
  GRID_SIZE,
} from "../types/game";

/** Create an empty grid */
export function createEmptyGrid(
  rows: number = GRID_SIZE,
  cols: number = GRID_SIZE,
): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ filled: false, color: null })),
  );
}

/** Check if a position is within grid bounds */
export function isWithinBounds(
  position: Position,
  rows: number = GRID_SIZE,
  cols: number = GRID_SIZE,
): boolean {
  return (
    position.row >= 0 &&
    position.row < rows &&
    position.col >= 0 &&
    position.col < cols
  );
}

/** Check if a block can be placed at a given position */
export function canPlaceBlock(
  grid: Cell[][],
  block: Block,
  position: Position,
): boolean {
  const { shape } = block;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const targetRow = position.row + r;
        const targetCol = position.col + c;

        // Check bounds
        if (!isWithinBounds({ row: targetRow, col: targetCol })) {
          return false;
        }

        // Check if cell is already filled
        if (grid[targetRow][targetCol].filled) {
          return false;
        }
      }
    }
  }

  return true;
}

/** Place a block on the grid (returns new grid, does not mutate) */
export function placeBlock(
  grid: Cell[][],
  block: Block,
  position: Position,
): Cell[][] {
  // Create a deep copy of the grid
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  const { shape, color } = block;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const targetRow = position.row + r;
        const targetCol = position.col + c;
        newGrid[targetRow][targetCol] = { filled: true, color };
      }
    }
  }

  return newGrid;
}

/** Find all completed rows and columns */
export function findCompletedLines(grid: Cell[][]): Line[] {
  const lines: Line[] = [];
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Check rows
  for (let r = 0; r < rows; r++) {
    if (grid[r].every((cell) => cell.filled)) {
      lines.push({ type: "row", index: r });
    }
  }

  // Check columns
  for (let c = 0; c < cols; c++) {
    let columnFilled = true;
    for (let r = 0; r < rows; r++) {
      if (!grid[r][c].filled) {
        columnFilled = false;
        break;
      }
    }
    if (columnFilled) {
      lines.push({ type: "col", index: c });
    }
  }

  return lines;
}

/** Clear completed lines from the grid */
export function clearLines(grid: Cell[][], lines: Line[]): Cell[][] {
  if (lines.length === 0) return grid;

  // Create a deep copy
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  // Collect all cells to clear (using Set to avoid duplicates)
  const cellsToClear = new Set<string>();

  for (const line of lines) {
    if (line.type === "row") {
      for (let c = 0; c < newGrid[0].length; c++) {
        cellsToClear.add(`${line.index},${c}`);
      }
    } else {
      for (let r = 0; r < newGrid.length; r++) {
        cellsToClear.add(`${r},${line.index}`);
      }
    }
  }

  // Clear all marked cells
  for (const key of cellsToClear) {
    const [r, c] = key.split(",").map(Number);
    newGrid[r][c] = { filled: false, color: null };
  }

  return newGrid;
}

/** Check if any block in the tray can be placed anywhere on the grid */
export function canPlaceAnyBlock(grid: Cell[][], tray: TrayBlock[]): boolean {
  const availableBlocks = tray.filter((tb) => !tb.used);

  for (const trayBlock of availableBlocks) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (canPlaceBlock(grid, trayBlock.block, { row: r, col: c })) {
          return true;
        }
      }
    }
  }

  return false;
}

/** Check if the game is over (no valid moves) */
export function checkGameOver(grid: Cell[][], tray: TrayBlock[]): boolean {
  return !canPlaceAnyBlock(grid, tray);
}

/** Calculate score from a placement */
export function calculateScore(
  blocksPlaced: number,
  linesCleared: number,
  isCombo: boolean,
): number {
  // Base points for placing blocks (1 point per cell)
  let score = blocksPlaced;

  if (linesCleared > 0) {
    // Points for clearing lines: 10 points per line
    // Bonus for multiple lines: multiplied by number of lines
    const linePoints = linesCleared * 10 * linesCleared;
    score += linePoints;

    // Combo bonus: 50% extra if this is a consecutive clear
    if (isCombo) {
      score = Math.floor(score * 1.5);
    }
  }

  return score;
}

/** Get the number of cells in a block shape */
export function getBlockCellCount(block: Block): number {
  let count = 0;
  for (const row of block.shape) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

/** Process a block placement - returns new state after placing and clearing */
export function processPlacement(
  grid: Cell[][],
  block: Block,
  position: Position,
  previousLinesCleared: boolean,
): PlacementResult {
  // Place the block
  const gridAfterPlacement = placeBlock(grid, block, position);

  // Find and clear completed lines
  const lines = findCompletedLines(gridAfterPlacement);
  const newGrid = clearLines(gridAfterPlacement, lines);

  // Calculate score
  const cellCount = getBlockCellCount(block);
  const isCombo = previousLinesCleared && lines.length > 0;
  const pointsEarned = calculateScore(cellCount, lines.length, isCombo);

  return {
    newGrid,
    linesCleared: lines,
    pointsEarned,
    isCombo,
  };
}

/** Find valid drop positions for a block (for highlighting) */
export function findValidDropPositions(
  grid: Cell[][],
  block: Block,
): Position[] {
  const positions: Position[] = [];

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (canPlaceBlock(grid, block, { row: r, col: c })) {
        positions.push({ row: r, col: c });
      }
    }
  }

  return positions;
}

/** Get the cells that would be filled if a block was placed at a position */
export function getBlockCells(block: Block, position: Position): Position[] {
  const cells: Position[] = [];

  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (block.shape[r][c]) {
        cells.push({
          row: position.row + r,
          col: position.col + c,
        });
      }
    }
  }

  return cells;
}
