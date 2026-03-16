// Block Blast - Draggable Block Component
import { memo } from "react";
import { type Block } from "../../types/game";
import { useDraggable } from "../../lib/dnd";

export interface DraggableBlockProps {
  block: Block;
  disabled?: boolean;
  cellSize?: number;
}

/** Render a block shape as a mini grid */
export function BlockShape({
  block,
  cellSize = 40,
}: {
  block: Block;
  cellSize?: number;
}) {
  const gap = 2;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${block.shape[0].length}, ${cellSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {block.shape.map((row, rowIndex) =>
        row.map((filled, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="rounded-sm transition-all"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: filled ? block.color : "transparent",
              boxShadow: filled ? "inset 0 -2px 4px rgba(0,0,0,0.2)" : "none",
            }}
          />
        )),
      )}
    </div>
  );
}

function DraggableBlockComponent({
  block,
  disabled = false,
  cellSize = 40,
}: DraggableBlockProps) {
  const { isDragging, draggableProps } = useDraggable({
    id: block.id,
    type: "block",
    data: block,
    disabled,
  });

  return (
    <div
      {...draggableProps}
      className={`
        rounded-lg transition-all select-none
        ${isDragging ? "opacity-30" : "opacity-100"}
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing hover:scale-105"}
      `}
    >
      <BlockShape block={block} cellSize={cellSize} />
    </div>
  );
}

export const DraggableBlock = memo(DraggableBlockComponent);
