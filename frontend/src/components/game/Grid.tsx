// Block Blast - Grid Component
import { useMemo } from "react";
import { Cell } from "./Cell";
import {
  type Cell as CellType,
  type Position,
  type Line,
  GRID_SIZE,
} from "../../types/game";

export interface GridProps {
  grid: CellType[][];
  previewCells?: Position[];
  previewColor?: string | null;
  canDrop?: boolean;
  clearingLines?: Line[];
  onCellClick?: (position: Position) => void;
  isDimmed?: boolean;
}

export function Grid({
  grid,
  previewCells = [],
  previewColor = null,
  canDrop = false,
  clearingLines = [],
  isDimmed = false,
}: GridProps) {
  // Create a set of preview cell keys for fast lookup
  const previewCellSet = useMemo(() => {
    return new Set(previewCells.map((p) => `${p.row},${p.col}`));
  }, [previewCells]);

  // Create a set of clearing cell keys
  const clearingCellSet = useMemo(() => {
    const cells = new Set<string>();
    for (const line of clearingLines) {
      if (line.type === "row") {
        for (let c = 0; c < GRID_SIZE; c++) {
          cells.add(`${line.index},${c}`);
        }
      } else {
        for (let r = 0; r < GRID_SIZE; r++) {
          cells.add(`${r},${line.index}`);
        }
      }
    }
    return cells;
  }, [clearingLines]);

  return (
    <div
      className={`relative transition-all duration-500 ${isDimmed ? "animate-grid-dim" : ""}`}
    >
      {/* Grid background with lines */}
      <div className="absolute inset-0 bg-indigo-950/80 rounded-xl border border-white/10" />

      {/* Grid cells */}
      <div
        className="relative grid p-2 rounded-xl"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          aspectRatio: "1",
          gap: "2px",
          backgroundColor: "rgb(99 102 241 / 0.3)", // indigo grid lines
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isPreview = previewCellSet.has(key);
            const isClearing = clearingCellSet.has(key);

            return (
              <Cell
                key={key}
                filled={cell.filled}
                color={isPreview && !cell.filled ? previewColor : cell.color}
                isPreview={isPreview && !cell.filled}
                isClearing={isClearing}
                canDrop={canDrop && !cell.filled && !isPreview}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
