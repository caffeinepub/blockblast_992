// Block Blast - Animated Menu Background with Floating Blocks
import { useMemo } from "react";
import { BLOCK_COLORS, type BlockColorName } from "../../types/game";
import { BLOCK_SHAPES, type ShapeDefinition } from "../../data/blockShapes";
import { useTheme, THEMES } from "../../hooks/useTheme";

/** Depth layer for parallax effect */
type ParallaxLayer = "back" | "middle" | "front";

interface FloatingBlock {
  id: number;
  shape: ShapeDefinition;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
  layer: ParallaxLayer;
}

/** Layer configuration for parallax effect */
const LAYER_CONFIG: Record<
  ParallaxLayer,
  {
    scaleRange: [number, number];
    opacityRange: [number, number];
    durationRange: [number, number];
    floatDistance: number;
  }
> = {
  back: {
    scaleRange: [0.3, 0.5],
    opacityRange: [0.08, 0.15],
    durationRange: [25, 40],
    floatDistance: 15,
  },
  middle: {
    scaleRange: [0.5, 0.8],
    opacityRange: [0.15, 0.25],
    durationRange: [15, 25],
    floatDistance: 25,
  },
  front: {
    scaleRange: [0.8, 1.2],
    opacityRange: [0.2, 0.35],
    durationRange: [10, 18],
    floatDistance: 40,
  },
};

/** Generate random floating blocks for the background with parallax layers */
function generateFloatingBlocks(count: number): FloatingBlock[] {
  const blocks: FloatingBlock[] = [];

  // Use a subset of visually interesting shapes
  const interestingShapes = BLOCK_SHAPES.filter((s) =>
    [
      "square-2x2",
      "t-shape",
      "l-shape",
      "corner-3-bl",
      "plus",
      "s-shape",
      "z-shape",
      "horizontal-3",
      "vertical-3",
    ].includes(s.name),
  );

  const layers: ParallaxLayer[] = ["back", "middle", "front"];

  for (let i = 0; i < count; i++) {
    const shape =
      interestingShapes[Math.floor(Math.random() * interestingShapes.length)];
    // Distribute blocks across layers: more in back, fewer in front
    const layerIndex = i < count * 0.4 ? 0 : i < count * 0.75 ? 1 : 2;
    const layer = layers[layerIndex];
    const config = LAYER_CONFIG[layer];

    blocks.push({
      id: i,
      shape,
      x: Math.random() * 100,
      y: Math.random() * 120 - 20, // Start some above viewport
      rotation: Math.random() * 360,
      scale:
        config.scaleRange[0] +
        Math.random() * (config.scaleRange[1] - config.scaleRange[0]),
      opacity:
        config.opacityRange[0] +
        Math.random() * (config.opacityRange[1] - config.opacityRange[0]),
      animationDuration:
        config.durationRange[0] +
        Math.random() * (config.durationRange[1] - config.durationRange[0]),
      animationDelay: Math.random() * -30,
      layer,
    });
  }

  return blocks;
}

/** Render a single block shape as cells */
function BlockShape({
  shape,
  color,
  scale,
}: {
  shape: boolean[][];
  color: string;
  scale: number;
}) {
  const cellSize = 12 * scale;
  const gap = 2 * scale;

  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {shape.map((row, rowIdx) => (
        <div key={rowIdx} className="flex" style={{ gap: `${gap}px` }}>
          {row.map((cell, colIdx) => (
            <div
              key={colIdx}
              className="rounded-sm"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: cell ? color : "transparent",
                boxShadow: cell
                  ? `inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.2)`
                  : "none",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Individual floating block with parallax animation */
function FloatingBlockElement({ block }: { block: FloatingBlock }) {
  const color = BLOCK_COLORS[block.shape.color as BlockColorName];
  const floatDistance = LAYER_CONFIG[block.layer].floatDistance;

  // Z-index based on layer for proper stacking
  const zIndex = block.layer === "back" ? 1 : block.layer === "middle" ? 2 : 3;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${block.x}%`,
        top: `${block.y}%`,
        transform: `rotate(${block.rotation}deg)`,
        opacity: block.opacity,
        animation: `float-${block.layer} ${block.animationDuration}s ease-in-out infinite`,
        animationDelay: `${block.animationDelay}s`,
        zIndex,
        // Apply blur for depth effect on back layer
        filter: block.layer === "back" ? "blur(1px)" : "none",
      }}
    >
      <BlockShape shape={block.shape.shape} color={color} scale={block.scale} />
    </div>
  );
}

/** Menu background with animated floating blocks */
export function MenuBackground() {
  const blocks = useMemo(() => generateFloatingBlocks(18), []);

  // Try to use theme context, fall back to default if not available
  let theme = THEMES.default;
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch {
    // Use default theme if provider not available
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.background}`}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.accentGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Floating blocks */}
      {blocks.map((block) => (
        <FloatingBlockElement key={block.id} block={block} />
      ))}

      {/* CSS for parallax float animations */}
      <style>{`
        @keyframes float-back {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-15px) rotate(calc(var(--rotation, 0deg) + 5deg));
          }
        }

        @keyframes float-middle {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-25px) rotate(calc(var(--rotation, 0deg) + 8deg));
          }
        }

        @keyframes float-front {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-40px) rotate(calc(var(--rotation, 0deg) + 12deg));
          }
        }
      `}</style>
    </div>
  );
}
