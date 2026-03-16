// Block Blast - Cell Component
import { memo, useState, useEffect, useRef } from "react";

export interface CellProps {
  filled: boolean;
  color: string | null;
  isPreview?: boolean;
  isClearing?: boolean;
  canDrop?: boolean;
}

function CellComponent({
  filled,
  color,
  isPreview,
  isClearing,
  canDrop,
}: CellProps) {
  // Track if this cell was just placed (for animation)
  const [justPlaced, setJustPlaced] = useState(false);
  const wasFilledRef = useRef(filled);

  // Detect when cell becomes filled (block placement)
  useEffect(() => {
    if (filled && !wasFilledRef.current && !isClearing) {
      setJustPlaced(true);
      const timer = setTimeout(() => setJustPlaced(false), 200);
      return () => clearTimeout(timer);
    }
    wasFilledRef.current = filled;
  }, [filled, isClearing]);

  // Determine cell styles
  const baseClasses = "w-full h-full rounded-sm";

  let cellClasses = baseClasses;
  let cellStyle: React.CSSProperties = {};

  if (isClearing) {
    // Cell is being cleared - flash animation
    cellClasses += " animate-line-clear";
    cellStyle.backgroundColor = color || "#94A3B8";
  } else if (filled) {
    // Cell is filled
    cellClasses += " shadow-inner transition-colors duration-150";
    if (justPlaced) {
      cellClasses += " animate-block-place";
    }
    cellStyle.backgroundColor = color || "#94A3B8";
  } else if (isPreview) {
    // Preview where block will be placed - subtle pulsing
    cellClasses += " opacity-70 transition-opacity duration-100";
    cellStyle.backgroundColor = color || "#94A3B8";
  } else {
    // Empty cell - dark color for grid appearance (no hover effect)
    cellClasses += " bg-indigo-950/60 transition-colors duration-150";
  }

  return <div className={cellClasses} style={cellStyle} />;
}

// Memoize to prevent unnecessary re-renders (64 cells on the grid)
export const Cell = memo(CellComponent);
