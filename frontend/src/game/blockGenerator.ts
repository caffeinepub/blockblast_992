// Block Blast - Block Generator
import {
  type Block,
  type TrayBlock,
  BLOCK_COLORS,
  TRAY_SIZE,
} from "../types/game";
import { BLOCK_SHAPES, getTotalWeight } from "../data/blockShapes";

let blockIdCounter = 0;

/** Generate a unique block ID */
function generateBlockId(): string {
  return `block-${Date.now()}-${++blockIdCounter}`;
}

/** Get a random block shape using weighted randomness */
export function generateRandomBlock(): Block {
  const totalWeight = getTotalWeight();
  let random = Math.random() * totalWeight;

  for (const shapeDef of BLOCK_SHAPES) {
    random -= shapeDef.weight;
    if (random <= 0) {
      return {
        id: generateBlockId(),
        shape: shapeDef.shape,
        color: BLOCK_COLORS[shapeDef.color],
        name: shapeDef.name,
      };
    }
  }

  // Fallback to first shape (should never happen)
  const fallback = BLOCK_SHAPES[0];
  return {
    id: generateBlockId(),
    shape: fallback.shape,
    color: BLOCK_COLORS[fallback.color],
    name: fallback.name,
  };
}

/** Generate a tray of random blocks */
export function generateTray(size: number = TRAY_SIZE): TrayBlock[] {
  return Array.from({ length: size }, () => ({
    block: generateRandomBlock(),
    used: false,
  }));
}

/** Check if all blocks in the tray have been used */
export function isTrayEmpty(tray: TrayBlock[]): boolean {
  return tray.every((tb) => tb.used);
}

/** Mark a block as used in the tray */
export function markBlockUsed(tray: TrayBlock[], blockId: string): TrayBlock[] {
  return tray.map((tb) =>
    tb.block.id === blockId ? { ...tb, used: true } : tb,
  );
}

/** Get available (unused) blocks from the tray */
export function getAvailableBlocks(tray: TrayBlock[]): TrayBlock[] {
  return tray.filter((tb) => !tb.used);
}
