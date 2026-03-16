/**
 * @fileoverview useDropZone Hook
 * Creates a drop zone that can receive draggable items
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useDnDContext } from "./context";
import type {
  DropZoneConfig,
  UseDropZoneReturn,
  DropState,
  Point,
  DragType,
} from "./types";
import { isPointInRect, getRect } from "./utils";

// ============================================================================
// Hook
// ============================================================================

/**
 * Create a drop zone that can receive draggable items
 *
 * @example
 * ```tsx
 * function DropArea({ onItemDropped }) {
 *   const { dropState, dropZoneProps } = useDropZone({
 *     id: 'drop-area',
 *     accept: 'item',
 *     onDrop: (item, position) => onItemDropped(item, position),
 *     canDrop: (item) => item.isValid,
 *   });
 *
 *   return (
 *     <div
 *       {...dropZoneProps}
 *       className={dropState.isOver ? 'highlight' : ''}
 *     >
 *       Drop items here
 *     </div>
 *   );
 * }
 * ```
 */
export function useDropZone<T>(config: DropZoneConfig<T>): UseDropZoneReturn {
  const {
    id,
    accept,
    onDrop,
    canDrop,
    onDragEnter,
    onDragOver,
    onDragLeave,
    disabled = false,
  } = config;

  const { dragState, registerDropZone, unregisterDropZone, setOverDropZone } =
    useDnDContext();

  // Element ref
  const elementRef = useRef<HTMLElement | null>(null);

  // Drop state
  const [dropState, setDropState] = useState<DropState>({
    isOver: false,
    canDrop: false,
    dragData: null,
  });

  // Refs to avoid stale closures
  const configRef = useRef(config);
  const dropStateRef = useRef(dropState);
  const dragStateRef = useRef(dragState);
  const prevIsOverRef = useRef(false);

  // Keep refs updated
  configRef.current = config;
  dropStateRef.current = dropState;
  dragStateRef.current = dragState;

  // ========================================================================
  // Helper Functions
  // ========================================================================

  /** Check if the current drag type is accepted */
  const isAcceptedType = useCallback(
    (type: DragType): boolean => {
      if (disabled) return false;
      const acceptTypes = Array.isArray(accept) ? accept : [accept];
      return acceptTypes.includes(type);
    },
    [accept, disabled],
  );

  /** Check if current position is over this drop zone */
  const isPositionOver = useCallback((position: Point | null): boolean => {
    if (!position || !elementRef.current) return false;
    const rect = getRect(elementRef.current);
    return isPointInRect(position, rect);
  }, []);

  /** Check if the payload can be dropped */
  const checkCanDrop = useCallback(
    (payload: T): boolean => {
      if (disabled) return false;
      if (canDrop) {
        return canDrop(payload);
      }
      return true;
    },
    [disabled, canDrop],
  );

  // ========================================================================
  // Drag State Effect
  // ========================================================================

  useEffect(() => {
    const currentConfig = configRef.current;

    // Not dragging or drag type not accepted
    if (
      !dragState.isDragging ||
      !dragState.data ||
      !isAcceptedType(dragState.data.type)
    ) {
      // If we were over, fire leave callback
      if (prevIsOverRef.current) {
        prevIsOverRef.current = false;
        setDropState({ isOver: false, canDrop: false, dragData: null });
        currentConfig.onDragLeave?.();
        setOverDropZone(null);
      }
      return;
    }

    const isOver = isPositionOver(dragState.position);
    const canDropHere = isOver && checkCanDrop(dragState.data.payload as T);

    // State changed - update
    if (isOver !== prevIsOverRef.current) {
      if (isOver) {
        // Entered the zone
        setDropState({
          isOver: true,
          canDrop: canDropHere,
          dragData: dragState.data,
        });
        setOverDropZone(id);
        currentConfig.onDragEnter?.(dragState.data.payload as T);
      } else {
        // Left the zone
        setDropState({ isOver: false, canDrop: false, dragData: null });
        setOverDropZone(null);
        currentConfig.onDragLeave?.();
      }
      prevIsOverRef.current = isOver;
    } else if (isOver) {
      // Still over - update canDrop and fire onDragOver
      setDropState((prev) => ({
        ...prev,
        canDrop: canDropHere,
        dragData: dragState.data,
      }));

      if (dragState.position) {
        currentConfig.onDragOver?.(
          dragState.data.payload as T,
          dragState.position,
        );
      }
    }
  }, [
    dragState.isDragging,
    dragState.data,
    dragState.position,
    id,
    isAcceptedType,
    isPositionOver,
    checkCanDrop,
    setOverDropZone,
  ]);

  // ========================================================================
  // Drop Handler
  // ========================================================================

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleDrop = () => {
      const currentDropState = dropStateRef.current;
      const currentDragState = dragStateRef.current;
      const currentConfig = configRef.current;

      if (
        currentDropState.isOver &&
        currentDropState.canDrop &&
        currentDragState.data &&
        currentDragState.position
      ) {
        currentConfig.onDrop(
          currentDragState.data.payload as T,
          currentDragState.position,
        );
      }
    };

    // Use capture phase to run before useDraggable's endDrag clears state
    document.addEventListener("mouseup", handleDrop, true);
    document.addEventListener("touchend", handleDrop, true);

    return () => {
      document.removeEventListener("mouseup", handleDrop, true);
      document.removeEventListener("touchend", handleDrop, true);
    };
  }, [dragState.isDragging]);

  // ========================================================================
  // Registration
  // ========================================================================

  const setRef = useCallback(
    (element: HTMLElement | null) => {
      // Unregister old element
      if (elementRef.current && elementRef.current !== element) {
        unregisterDropZone(id);
      }

      elementRef.current = element;

      // Register new element
      if (element) {
        registerDropZone(id, element);
      }
    },
    [id, registerDropZone, unregisterDropZone],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unregisterDropZone(id);
    };
  }, [id, unregisterDropZone]);

  // ========================================================================
  // Return Value
  // ========================================================================

  const isActive =
    dragState.isDragging &&
    dragState.data != null &&
    isAcceptedType(dragState.data.type);

  return {
    dropState,
    isActive,
    dropZoneProps: {
      ref: setRef,
      "aria-dropeffect": isActive ? "move" : "none",
      style: {
        position: "relative",
      },
    },
  };
}

// Re-export types
export type { UseDropZoneReturn };
