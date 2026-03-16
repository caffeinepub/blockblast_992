// Block Blast - Block Tray Component
import { useRef, useState, useEffect, useCallback } from "react";
import { type TrayBlock } from "../../types/game";
import { DraggableBlock } from "./DraggableBlock";

export interface TrayProps {
  tray: TrayBlock[];
  cellSize: number;
}

/** Calculate the optimal cell size for a block to fit within a slot (both horizontally and vertically) */
function getScaledCellSize(
  block: TrayBlock["block"],
  maxSlotWidth: number,
  maxSlotHeight: number,
  baseCellSize: number,
): number {
  const blockCols = block.shape[0]?.length ?? 1;
  const blockRows = block.shape.length ?? 1;
  const gap = 2; // Gap between cells

  // Calculate horizontal scaling
  const blockWidth = blockCols * baseCellSize + (blockCols - 1) * gap;
  let horizontalCellSize = baseCellSize;
  if (blockWidth > maxSlotWidth) {
    horizontalCellSize = (maxSlotWidth - (blockCols - 1) * gap) / blockCols;
  }

  // Calculate vertical scaling
  const blockHeight = blockRows * baseCellSize + (blockRows - 1) * gap;
  let verticalCellSize = baseCellSize;
  if (blockHeight > maxSlotHeight) {
    verticalCellSize = (maxSlotHeight - (blockRows - 1) * gap) / blockRows;
  }

  // Use the smaller of the two to ensure block fits both dimensions
  const scaledCellSize = Math.min(horizontalCellSize, verticalCellSize);
  return Math.max(scaledCellSize, 16); // Minimum 16px to keep blocks usable
}

export function Tray({ tray, cellSize }: TrayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState<number>(0);
  const [slotHeight, setSlotHeight] = useState<number>(0);

  const updateSlotDimensions = useCallback(() => {
    if (containerRef.current) {
      // Container width minus padding and gaps
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const horizontalPadding = 32; // px-3 sm:px-4 = ~12-16px each side
      const verticalPadding = 28; // py-3 sm:py-4 = ~12-16px each side
      const gaps = 40; // gap-3 sm:gap-5 ~ 12-20px per gap, 2 gaps
      const availableWidth = containerWidth - horizontalPadding - gaps;
      const availableHeight = containerHeight - verticalPadding;
      const perSlotWidth = availableWidth / 3;
      setSlotWidth(perSlotWidth);
      setSlotHeight(availableHeight);
    }
  }, []);

  useEffect(() => {
    updateSlotDimensions();
    window.addEventListener("resize", updateSlotDimensions);
    return () => window.removeEventListener("resize", updateSlotDimensions);
  }, [updateSlotDimensions]);

  return (
    <div
      ref={containerRef}
      className="h-full bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 py-3 sm:py-4 px-3 sm:px-4"
    >
      <div className="h-full flex justify-around items-center gap-3 sm:gap-5">
        {tray.map((trayBlock) => {
          // Calculate scaled cell size for this specific block (both horizontal and vertical)
          const scaledCellSize =
            slotWidth > 0 && slotHeight > 0
              ? getScaledCellSize(
                  trayBlock.block,
                  slotWidth - 8,
                  slotHeight - 8,
                  cellSize,
                ) // -8 for inner padding
              : cellSize;

          return (
            <div
              key={trayBlock.block.id}
              className={`
                flex items-center justify-center
                p-1 sm:p-2
                transition-all duration-200
                min-w-0 flex-1
                overflow-hidden
                ${trayBlock.used ? "opacity-30" : ""}
              `}
              style={{ maxWidth: slotWidth > 0 ? `${slotWidth}px` : "auto" }}
            >
              {!trayBlock.used && (
                <DraggableBlock
                  block={trayBlock.block}
                  disabled={trayBlock.used}
                  cellSize={scaledCellSize}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
