// Block Blast - Drag and Drop Integration Hook
import { useState, useCallback, useRef } from "react";
import { type Block, type Position, GRID_SIZE } from "../types/game";
import { canPlaceBlock } from "../game/gameLogic";
import { type Cell } from "../types/game";

// Constants that must match Grid component
const GRID_PADDING = 8; // p-2 in Grid component
const GRID_GAP = 2; // gap in Grid component

/** Calculate cell size from grid element dimensions */
export function calculateCellSize(gridElement: HTMLElement | null): number {
  if (!gridElement) return 40; // Default fallback
  const rect = gridElement.getBoundingClientRect();
  const innerWidth = rect.width - GRID_PADDING * 2;
  const totalGaps = (GRID_SIZE - 1) * GRID_GAP;
  return (innerWidth - totalGaps) / GRID_SIZE;
}

export interface UseDragDropReturn {
  previewPosition: Position | null;
  previewBlock: Block | null;
  canDrop: boolean;
  handleDragOver: (
    block: Block,
    cursorPosition: { x: number; y: number },
  ) => void;
  handleDragLeave: () => void;
  handleDrop: (
    block: Block,
    cursorPosition: { x: number; y: number },
  ) => Position | null;
  setGridRef: (element: HTMLElement | null) => void;
  /** Get current cell size - calculates from grid element on each call */
  getCellSize: () => number;
}

export function useDragDrop(
  grid: Cell[][],
  onPlaceBlock: (block: Block, position: Position) => boolean,
): UseDragDropReturn {
  const [previewPosition, setPreviewPosition] = useState<Position | null>(null);
  const [previewBlock, setPreviewBlock] = useState<Block | null>(null);
  const [canDrop, setCanDrop] = useState(false);
  const gridRef = useRef<HTMLElement | null>(null);

  // Calculate grid position from cursor position
  const cursorToGridPosition = useCallback(
    (cursorX: number, cursorY: number, block: Block): Position | null => {
      if (!gridRef.current) return null;

      const rect = gridRef.current.getBoundingClientRect();

      // Calculate cell size from actual grid dimensions
      const innerWidth = rect.width - GRID_PADDING * 2;
      const totalGaps = (GRID_SIZE - 1) * GRID_GAP;
      const cellSize = (innerWidth - totalGaps) / GRID_SIZE;
      const cellWithGap = cellSize + GRID_GAP;

      // Calculate position relative to grid inner area (where cells start)
      const relX = cursorX - rect.left - GRID_PADDING;
      const relY = cursorY - rect.top - GRID_PADDING;

      // Get block dimensions
      const blockWidth = block.shape[0].length;
      const blockHeight = block.shape.length;

      // Calculate the exact center offset that matches CSS translate(-50%, -50%)
      // BlockShape pixel dimensions: blockWidth * cellSize + (blockWidth - 1) * GRID_GAP
      // CSS centers the overlay, so cursor is at pixel center of the block
      const blockPixelWidth =
        blockWidth * cellSize + (blockWidth - 1) * GRID_GAP;
      const blockPixelHeight =
        blockHeight * cellSize + (blockHeight - 1) * GRID_GAP;
      const centerOffsetX = blockPixelWidth / 2;
      const centerOffsetY = blockPixelHeight / 2;

      // Calculate where the block's top-left would be in pixels, then convert to cells
      const blockTopLeftX = relX - centerOffsetX;
      const blockTopLeftY = relY - centerOffsetY;

      // Convert to cell coordinates
      // Using floor means the preview changes when the block's top-left crosses cell boundaries
      let col = Math.floor(blockTopLeftX / cellWithGap);
      let row = Math.floor(blockTopLeftY / cellWithGap);

      // Clamp to valid range
      row = Math.max(0, Math.min(row, GRID_SIZE - blockHeight));
      col = Math.max(0, Math.min(col, GRID_SIZE - blockWidth));

      return { row, col };
    },
    [],
  );

  const handleDragOver = useCallback(
    (block: Block, cursorPosition: { x: number; y: number }) => {
      const position = cursorToGridPosition(
        cursorPosition.x,
        cursorPosition.y,
        block,
      );

      if (position) {
        const valid = canPlaceBlock(grid, block, position);
        // Only show preview when the move is valid
        if (valid) {
          setPreviewPosition(position);
          setPreviewBlock(block);
          setCanDrop(true);
        } else {
          setPreviewPosition(null);
          setPreviewBlock(null);
          setCanDrop(false);
        }
      } else {
        setPreviewPosition(null);
        setPreviewBlock(null);
        setCanDrop(false);
      }
    },
    [grid, cursorToGridPosition],
  );

  const handleDragLeave = useCallback(() => {
    setPreviewPosition(null);
    setPreviewBlock(null);
    setCanDrop(false);
  }, []);

  const handleDrop = useCallback(
    (
      block: Block,
      cursorPosition: { x: number; y: number },
    ): Position | null => {
      const position = cursorToGridPosition(
        cursorPosition.x,
        cursorPosition.y,
        block,
      );

      // Clear preview state
      setPreviewPosition(null);
      setPreviewBlock(null);
      setCanDrop(false);

      if (position && canPlaceBlock(grid, block, position)) {
        const success = onPlaceBlock(block, position);
        if (success) {
          return position;
        }
      }

      return null;
    },
    [grid, cursorToGridPosition, onPlaceBlock],
  );

  const setGridRef = useCallback((element: HTMLElement | null) => {
    gridRef.current = element;
  }, []);

  // Get current cell size - calculates fresh from grid element
  const getCellSize = useCallback(() => {
    return calculateCellSize(gridRef.current);
  }, []);

  return {
    previewPosition,
    previewBlock,
    canDrop,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setGridRef,
    getCellSize,
  };
}
