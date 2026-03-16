/**
 * @fileoverview DnD Context Provider
 * Manages global drag state and coordinates drag operations
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  type DnDContextValue,
  type DnDProviderConfig,
  type DragState,
  type DragData,
  type Point,
  type DropZoneId,
  INITIAL_DRAG_STATE,
} from "./types";
import { delta } from "./utils";

// ============================================================================
// Context
// ============================================================================

const DnDContext = createContext<DnDContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface DnDProviderProps extends DnDProviderConfig {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function DnDProvider({
  children,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DnDProviderProps) {
  // Drag state
  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG_STATE);

  // Registry of drop zone elements
  const dropZonesRef = useRef<Map<DropZoneId, HTMLElement>>(new Map());

  // Refs for callbacks to avoid stale closures
  const callbacksRef = useRef({ onDragStart, onDragMove, onDragEnd });
  callbacksRef.current = { onDragStart, onDragMove, onDragEnd };

  // Ref for current state to avoid stale closures in event handlers
  const stateRef = useRef(dragState);
  stateRef.current = dragState;

  // ========================================================================
  // Drag Operations
  // ========================================================================

  const startDrag = useCallback(
    (data: DragData, position: Point, offset: Point) => {
      const newState: DragState = {
        phase: "dragging",
        isDragging: true,
        data,
        position,
        initialPosition: position,
        offset,
        delta: { x: 0, y: 0 },
        overDropZoneId: null,
      };

      setDragState(newState);

      // Fire callback
      callbacksRef.current.onDragStart?.({
        type: "drag-start",
        data,
        position,
      });
    },
    [],
  );

  const updateDrag = useCallback((position: Point) => {
    setDragState((prev) => {
      if (!prev.isDragging || !prev.initialPosition) return prev;

      const newDelta = delta(prev.initialPosition, position);

      // Fire callback
      if (prev.data) {
        callbacksRef.current.onDragMove?.({
          type: "drag-move",
          data: prev.data,
          position,
          delta: newDelta,
        });
      }

      return {
        ...prev,
        position,
        delta: newDelta,
      };
    });
  }, []);

  const endDrag = useCallback(() => {
    const currentState = stateRef.current;

    // Fire callback before resetting
    if (currentState.data) {
      callbacksRef.current.onDragEnd?.({
        type: "drag-end",
        data: currentState.data,
        position: currentState.position,
        dropZoneId: currentState.overDropZoneId,
        cancelled: false,
      });
    }

    setDragState(INITIAL_DRAG_STATE);
  }, []);

  const cancelDrag = useCallback(() => {
    const currentState = stateRef.current;

    // Fire callback with cancelled flag
    if (currentState.data) {
      callbacksRef.current.onDragEnd?.({
        type: "drag-end",
        data: currentState.data,
        position: currentState.position,
        dropZoneId: null,
        cancelled: true,
      });
    }

    setDragState(INITIAL_DRAG_STATE);
  }, []);

  // ========================================================================
  // Drop Zone Registry
  // ========================================================================

  const registerDropZone = useCallback(
    (id: DropZoneId, element: HTMLElement) => {
      dropZonesRef.current.set(id, element);
    },
    [],
  );

  const unregisterDropZone = useCallback((id: DropZoneId) => {
    dropZonesRef.current.delete(id);
  }, []);

  const setOverDropZone = useCallback((id: DropZoneId | null) => {
    setDragState((prev) => {
      if (prev.overDropZoneId === id) return prev;
      return { ...prev, overDropZoneId: id };
    });
  }, []);

  // ========================================================================
  // Keyboard Support
  // ========================================================================

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelDrag();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dragState.isDragging, cancelDrag]);

  // ========================================================================
  // Context Value
  // ========================================================================

  const contextValue: DnDContextValue = {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    registerDropZone,
    unregisterDropZone,
    setOverDropZone,
  };

  return (
    <DnDContext.Provider value={contextValue}>{children}</DnDContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access the DnD context
 * @throws Error if used outside of DnDProvider
 */
export function useDnDContext(): DnDContextValue {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error(
      "useDnDContext must be used within a DnDProvider. " +
        "Wrap your app or component tree with <DnDProvider>.",
    );
  }
  return context;
}

/**
 * Access the DnD context (optional - returns null if not in provider)
 */
export function useDnDContextOptional(): DnDContextValue | null {
  return useContext(DnDContext);
}
