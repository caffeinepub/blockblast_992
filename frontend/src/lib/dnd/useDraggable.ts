/**
 * @fileoverview useDraggable Hook
 * Makes an element draggable with mouse, touch, and keyboard support
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { useDnDContext } from "./context";
import type {
  DraggableConfig,
  UseDraggableReturn,
  Point,
  ActivationConstraints,
} from "./types";
import { getMousePoint, getTouchPoint, distance } from "./utils";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ACTIVATION: ActivationConstraints = {
  distance: 0,
  delay: 0,
  tolerance: 5,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Make an element draggable
 *
 * @example
 * ```tsx
 * function DraggableItem({ item }) {
 *   const { isDragging, draggableProps } = useDraggable({
 *     id: item.id,
 *     type: 'item',
 *     data: item,
 *   });
 *
 *   return (
 *     <div {...draggableProps} className={isDragging ? 'dragging' : ''}>
 *       {item.name}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDraggable<T>(
  config: DraggableConfig<T>,
): UseDraggableReturn {
  const {
    id,
    type,
    data,
    disabled = false,
    activation = DEFAULT_ACTIVATION,
  } = config;

  const { dragState, startDrag, updateDrag, endDrag, cancelDrag } =
    useDnDContext();

  // Track if this specific item is being dragged
  const isDragging = dragState.isDragging && dragState.data?.id === id;

  // Pending state for activation constraints
  const [isPending, setIsPending] = useState(false);

  // Refs for tracking drag state
  const isOurDragRef = useRef(false);
  const pendingStartRef = useRef<{
    position: Point;
    offset: Point;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Refs for latest values (avoid stale closures)
  const configRef = useRef(config);
  configRef.current = config;

  // ========================================================================
  // Activation Logic
  // ========================================================================

  const shouldActivate = useCallback(
    (initialPosition: Point, currentPosition: Point): boolean => {
      const { distance: minDistance = 0 } = activation;
      if (minDistance <= 0) return true;
      return distance(initialPosition, currentPosition) >= minDistance;
    },
    [activation],
  );

  const clearPending = useCallback(() => {
    if (pendingStartRef.current?.timer) {
      clearTimeout(pendingStartRef.current.timer);
    }
    pendingStartRef.current = null;
    setIsPending(false);
  }, []);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleDragStart = useCallback(
    (position: Point, offset: Point) => {
      if (disabled) return;

      const { delay = 0, distance: minDistance = 0 } = activation;

      // If no constraints, start immediately
      if (delay <= 0 && minDistance <= 0) {
        isOurDragRef.current = true;
        startDrag({ id, type, payload: data }, position, offset);
        return;
      }

      // Set pending state
      setIsPending(true);
      pendingStartRef.current = {
        position,
        offset,
        timer: null,
      };

      // If delay constraint, set timer
      if (delay > 0) {
        pendingStartRef.current.timer = setTimeout(() => {
          if (pendingStartRef.current) {
            isOurDragRef.current = true;
            startDrag({ id, type, payload: data }, position, offset);
            clearPending();
          }
        }, delay);
      }
    },
    [id, type, data, disabled, activation, startDrag, clearPending],
  );

  const handleMove = useCallback(
    (position: Point) => {
      // If pending, check activation constraints
      if (pendingStartRef.current && !isOurDragRef.current) {
        const { tolerance = 5 } = activation;
        const moved = distance(pendingStartRef.current.position, position);

        // Cancel if moved too far during delay
        if (pendingStartRef.current.timer && moved > tolerance) {
          clearPending();
          return;
        }

        // Check distance activation
        if (shouldActivate(pendingStartRef.current.position, position)) {
          isOurDragRef.current = true;
          startDrag(
            { id, type, payload: data },
            position,
            pendingStartRef.current.offset,
          );
          clearPending();
        }
        return;
      }

      // Normal drag move
      if (isOurDragRef.current) {
        updateDrag(position);
      }
    },
    [
      id,
      type,
      data,
      activation,
      shouldActivate,
      startDrag,
      updateDrag,
      clearPending,
    ],
  );

  const handleDragEnd = useCallback(() => {
    clearPending();

    if (isOurDragRef.current) {
      isOurDragRef.current = false;
      endDrag();
    }
  }, [endDrag, clearPending]);

  const handleCancel = useCallback(() => {
    clearPending();

    if (isOurDragRef.current) {
      isOurDragRef.current = false;
      cancelDrag();
    }
  }, [cancelDrag, clearPending]);

  // ========================================================================
  // Mouse Event Handlers
  // ========================================================================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      if (e.button !== 0) return; // Only left click

      e.preventDefault();

      const position = getMousePoint(e.nativeEvent);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      handleDragStart(position, offset);
    },
    [disabled, handleDragStart],
  );

  // ========================================================================
  // Touch Event Handlers
  // ========================================================================

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      e.preventDefault();

      const position = getTouchPoint(e.nativeEvent);
      if (!position) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const touch = e.touches[0];
      const offset = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };

      handleDragStart(position, offset);
    },
    [disabled, handleDragStart],
  );

  // ========================================================================
  // Keyboard Event Handlers
  // ========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      // Space or Enter to start drag
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        // For keyboard, we use the element center as position
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        const offset = { x: rect.width / 2, y: rect.height / 2 };
        handleDragStart(position, offset);
      }
    },
    [disabled, handleDragStart],
  );

  // ========================================================================
  // Global Event Listeners
  // ========================================================================

  useEffect(() => {
    if (!isDragging && !isPending) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(getMousePoint(e));
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const position = getTouchPoint(e);
      if (position) handleMove(position);
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();
    const handleTouchCancel = () => handleCancel();

    // Add listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchCancel);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [isDragging, isPending, handleMove, handleDragEnd, handleCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPending();
      if (isOurDragRef.current) {
        cancelDrag();
      }
    };
  }, [clearPending, cancelDrag]);

  // ========================================================================
  // Return Value
  // ========================================================================

  return {
    isDragging,
    isPending,
    draggableProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      onKeyDown: handleKeyDown,
      tabIndex: disabled ? -1 : 0,
      role: "button",
      "aria-pressed": isDragging,
      "aria-disabled": disabled,
      style: {
        cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      },
    },
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      style: {
        cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
        touchAction: "none",
      },
    },
  };
}

// Re-export types
export type { UseDraggableReturn };
