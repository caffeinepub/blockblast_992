/**
 * @fileoverview DragOverlay Component
 * Renders the dragged item following the cursor
 */

import { type ReactNode, type CSSProperties } from "react";
import { useDnDContext } from "./context";

// ============================================================================
// Types
// ============================================================================

export interface DragOverlayProps {
  /** Render function that receives the drag payload and returns the overlay content */
  children: (payload: unknown, isDragging: boolean) => ReactNode;
  /** Additional CSS class for the overlay container */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Z-index for the overlay (default: 9999) */
  zIndex?: number;
  /** Scale factor for the dragged item (default: 1.05) */
  scale?: number;
  /** Opacity of the overlay (default: 0.9) */
  opacity?: number;
  /** Whether to apply a drop shadow */
  dropShadow?: boolean;
  /** Custom transform origin (default: 'top left') */
  transformOrigin?: string;
  /** Animation duration for transitions */
  transitionDuration?: number;
  /** Center the overlay under the cursor instead of using grab offset */
  centered?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders the dragged item as a fixed overlay following the cursor
 *
 * @example
 * ```tsx
 * <DragOverlay>
 *   {(payload) => <ItemPreview item={payload} />}
 * </DragOverlay>
 * ```
 *
 * @example With custom styling
 * ```tsx
 * <DragOverlay
 *   scale={1.1}
 *   opacity={0.8}
 *   dropShadow
 *   zIndex={10000}
 * >
 *   {(payload, isDragging) => (
 *     <div className={isDragging ? 'dragging' : ''}>
 *       <ItemPreview item={payload} />
 *     </div>
 *   )}
 * </DragOverlay>
 * ```
 */
export function DragOverlay({
  children,
  className = "",
  style = {},
  zIndex = 9999,
  scale = 1.05,
  opacity = 0.9,
  dropShadow = true,
  transformOrigin = "top left",
  transitionDuration = 0,
  centered = false,
}: DragOverlayProps) {
  const { dragState } = useDnDContext();

  // Don't render if not dragging
  if (!dragState.isDragging || !dragState.position || !dragState.data) {
    return null;
  }

  const { position, offset, data } = dragState;

  // Calculate position - if centered, put cursor at center of overlay
  const x = centered ? position.x : position.x - offset.x;
  const y = centered ? position.y : position.y - offset.y;

  // Build transform string
  const transforms: string[] = [];
  transforms.push(`translate3d(${x}px, ${y}px, 0)`);
  // If centered, shift by -50% to put center under cursor
  if (centered) {
    transforms.push("translate(-50%, -50%)");
  }
  if (scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  // Build styles
  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex,
    pointerEvents: "none",
    transform: transforms.join(" "),
    transformOrigin: centered ? "center center" : transformOrigin,
    opacity,
    willChange: "transform",
    ...(dropShadow && {
      filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
    }),
    ...(transitionDuration > 0 && {
      transition: `transform ${transitionDuration}ms ease-out`,
    }),
    ...style,
  };

  return (
    <div
      className={className}
      style={overlayStyle}
      role="presentation"
      aria-hidden="true"
    >
      {children(data.payload, true)}
    </div>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

/**
 * Simple drag overlay with default styling
 */
export function SimpleDragOverlay({
  children,
}: {
  children: (payload: unknown) => ReactNode;
}) {
  return (
    <DragOverlay dropShadow scale={1.02} opacity={0.95}>
      {(payload) => children(payload)}
    </DragOverlay>
  );
}
