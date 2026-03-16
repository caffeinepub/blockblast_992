// Block Blast - Block Shape Definitions
import {
  type ShapeMatrix,
  BLOCK_COLORS,
  type BlockColorName,
} from "../types/game";

export interface ShapeDefinition {
  name: string;
  shape: ShapeMatrix;
  color: BlockColorName;
  weight: number; // Higher = more common
}

// Shape definitions with weighted randomness
export const BLOCK_SHAPES: ShapeDefinition[] = [
  // === Single blocks (most common) ===
  {
    name: "dot",
    shape: [[true]],
    color: "yellow",
    weight: 15,
  },

  // === 2-cell shapes ===
  {
    name: "horizontal-2",
    shape: [[true, true]],
    color: "cyan",
    weight: 12,
  },
  {
    name: "vertical-2",
    shape: [[true], [true]],
    color: "cyan",
    weight: 12,
  },

  // === 3-cell shapes ===
  {
    name: "horizontal-3",
    shape: [[true, true, true]],
    color: "blue",
    weight: 10,
  },
  {
    name: "vertical-3",
    shape: [[true], [true], [true]],
    color: "blue",
    weight: 10,
  },
  {
    name: "corner-3-bl",
    shape: [
      [true, false],
      [true, true],
    ],
    color: "orange",
    weight: 8,
  },
  {
    name: "corner-3-br",
    shape: [
      [false, true],
      [true, true],
    ],
    color: "orange",
    weight: 8,
  },
  {
    name: "corner-3-tl",
    shape: [
      [true, true],
      [true, false],
    ],
    color: "orange",
    weight: 8,
  },
  {
    name: "corner-3-tr",
    shape: [
      [true, true],
      [false, true],
    ],
    color: "orange",
    weight: 8,
  },

  // === 4-cell shapes ===
  {
    name: "horizontal-4",
    shape: [[true, true, true, true]],
    color: "green",
    weight: 6,
  },
  {
    name: "vertical-4",
    shape: [[true], [true], [true], [true]],
    color: "green",
    weight: 6,
  },
  {
    name: "square-2x2",
    shape: [
      [true, true],
      [true, true],
    ],
    color: "red",
    weight: 8,
  },
  {
    name: "t-shape",
    shape: [
      [true, true, true],
      [false, true, false],
    ],
    color: "purple",
    weight: 5,
  },
  {
    name: "t-shape-up",
    shape: [
      [false, true, false],
      [true, true, true],
    ],
    color: "purple",
    weight: 5,
  },
  {
    name: "t-shape-left",
    shape: [
      [true, false],
      [true, true],
      [true, false],
    ],
    color: "purple",
    weight: 5,
  },
  {
    name: "t-shape-right",
    shape: [
      [false, true],
      [true, true],
      [false, true],
    ],
    color: "purple",
    weight: 5,
  },
  {
    name: "s-shape",
    shape: [
      [false, true, true],
      [true, true, false],
    ],
    color: "green",
    weight: 5,
  },
  {
    name: "z-shape",
    shape: [
      [true, true, false],
      [false, true, true],
    ],
    color: "red",
    weight: 5,
  },

  // === 5-cell shapes ===
  {
    name: "horizontal-5",
    shape: [[true, true, true, true, true]],
    color: "pink",
    weight: 3,
  },
  {
    name: "vertical-5",
    shape: [[true], [true], [true], [true], [true]],
    color: "pink",
    weight: 3,
  },
  {
    name: "l-shape",
    shape: [
      [true, false],
      [true, false],
      [true, true],
    ],
    color: "orange",
    weight: 4,
  },
  {
    name: "l-shape-mirror",
    shape: [
      [false, true],
      [false, true],
      [true, true],
    ],
    color: "blue",
    weight: 4,
  },
  {
    name: "l-shape-rotated",
    shape: [
      [true, true, true],
      [true, false, false],
    ],
    color: "orange",
    weight: 4,
  },
  {
    name: "l-shape-rotated-mirror",
    shape: [
      [true, true, true],
      [false, false, true],
    ],
    color: "blue",
    weight: 4,
  },
  {
    name: "plus",
    shape: [
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ],
    color: "purple",
    weight: 3,
  },

  // === Large shapes (rare) ===
  {
    name: "square-3x3",
    shape: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
    color: "red",
    weight: 2,
  },
];

/** Get the dimensions of a shape */
export function getShapeDimensions(shape: ShapeMatrix): {
  rows: number;
  cols: number;
} {
  return {
    rows: shape.length,
    cols: shape[0]?.length ?? 0,
  };
}

/** Get the number of cells in a shape */
export function getShapeCellCount(shape: ShapeMatrix): number {
  let count = 0;
  for (const row of shape) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

/** Get total weight for probability calculations */
export function getTotalWeight(): number {
  return BLOCK_SHAPES.reduce((sum, shape) => sum + shape.weight, 0);
}
