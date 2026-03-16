/**
 * @fileoverview Type definitions for the DnD library
 * A lightweight, type-safe drag and drop system for React
 */

// ============================================================================
// Core Types
// ============================================================================

/** 2D coordinate point */
export interface Point {
  x: number;
  y: number;
}

/** Rectangle bounds */
export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Unique identifier for draggable items */
export type DraggableId = string;

/** Unique identifier for drop zones */
export type DropZoneId = string;

/** Type identifier for drag operations */
export type DragType = string;

// ============================================================================
// Drag Data & State
// ============================================================================

/** Data attached to a draggable item */
export interface DragData<T = unknown> {
  /** Unique identifier for this draggable */
  id: DraggableId;
  /** Type of drag operation - used for drop zone filtering */
  type: DragType;
  /** Custom payload data */
  payload: T;
}

/** Drag operation lifecycle phase */
export type DragPhase = "idle" | "pending" | "dragging" | "dropping";

/** Complete state of a drag operation */
export interface DragState<T = unknown> {
  /** Current phase of the drag operation */
  phase: DragPhase;
  /** Whether a drag is currently active */
  isDragging: boolean;
  /** Data for the currently dragged item */
  data: DragData<T> | null;
  /** Current cursor/touch position */
  position: Point | null;
  /** Initial position when drag started */
  initialPosition: Point | null;
  /** Offset from cursor to draggable top-left corner */
  offset: Point;
  /** Delta from initial position */
  delta: Point;
  /** ID of the drop zone currently being hovered */
  overDropZoneId: DropZoneId | null;
}

/** Initial/reset drag state */
export const INITIAL_DRAG_STATE: DragState = {
  phase: "idle",
  isDragging: false,
  data: null,
  position: null,
  initialPosition: null,
  offset: { x: 0, y: 0 },
  delta: { x: 0, y: 0 },
  overDropZoneId: null,
};

// ============================================================================
// Drop Zone Types
// ============================================================================

/** State of a drop zone */
export interface DropState {
  /** Whether a draggable is currently over this zone */
  isOver: boolean;
  /** Whether the current draggable can be dropped here */
  canDrop: boolean;
  /** The data of the item being dragged over (if any) */
  dragData: DragData | null;
}

/** Initial drop zone state */
export const INITIAL_DROP_STATE: DropState = {
  isOver: false,
  canDrop: false,
  dragData: null,
};

// ============================================================================
// Configuration Types
// ============================================================================

/** Activation constraints for starting a drag */
export interface ActivationConstraints {
  /** Minimum distance (px) to move before drag activates */
  distance?: number;
  /** Delay (ms) before drag activates */
  delay?: number;
  /** Tolerance (px) for movement during delay */
  tolerance?: number;
}

/** Configuration for a draggable element */
export interface DraggableConfig<T = unknown> {
  /** Unique identifier for this draggable */
  id: DraggableId;
  /** Type of drag - used for drop zone filtering */
  type: DragType;
  /** Custom payload data */
  data: T;
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Activation constraints */
  activation?: ActivationConstraints;
}

/** Configuration for a drop zone */
export interface DropZoneConfig<T = unknown> {
  /** Unique identifier for this drop zone */
  id: DropZoneId;
  /** Drag types this zone accepts (string or array) */
  accept: DragType | DragType[];
  /** Callback when an item is dropped */
  onDrop: (data: T, position: Point) => void;
  /** Optional function to determine if drop is allowed */
  canDrop?: (data: T) => boolean;
  /** Callback when draggable enters the zone */
  onDragEnter?: (data: T) => void;
  /** Callback when draggable moves within the zone */
  onDragOver?: (data: T, position: Point) => void;
  /** Callback when draggable leaves the zone */
  onDragLeave?: () => void;
  /** Whether this drop zone is disabled */
  disabled?: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

/** Event fired when drag starts */
export interface DragStartEvent<T = unknown> {
  type: "drag-start";
  data: DragData<T>;
  position: Point;
}

/** Event fired when drag position updates */
export interface DragMoveEvent<T = unknown> {
  type: "drag-move";
  data: DragData<T>;
  position: Point;
  delta: Point;
}

/** Event fired when drag ends (drop or cancel) */
export interface DragEndEvent<T = unknown> {
  type: "drag-end";
  data: DragData<T>;
  position: Point | null;
  dropZoneId: DropZoneId | null;
  cancelled: boolean;
}

/** Union of all drag events */
export type DragEvent<T = unknown> =
  | DragStartEvent<T>
  | DragMoveEvent<T>
  | DragEndEvent<T>;

// ============================================================================
// Context Types
// ============================================================================

/** DnD Provider configuration */
export interface DnDProviderConfig {
  /** Called when any drag operation starts */
  onDragStart?: (event: DragStartEvent) => void;
  /** Called when drag position updates */
  onDragMove?: (event: DragMoveEvent) => void;
  /** Called when drag ends */
  onDragEnd?: (event: DragEndEvent) => void;
}

/** Context value exposed by DnDProvider */
export interface DnDContextValue<T = unknown> {
  /** Current drag state */
  dragState: DragState<T>;
  /** Start a new drag operation */
  startDrag: (data: DragData<T>, position: Point, offset: Point) => void;
  /** Update the current drag position */
  updateDrag: (position: Point) => void;
  /** End the drag operation (successful drop) */
  endDrag: () => void;
  /** Cancel the drag operation */
  cancelDrag: () => void;
  /** Register a drop zone */
  registerDropZone: (id: DropZoneId, element: HTMLElement) => void;
  /** Unregister a drop zone */
  unregisterDropZone: (id: DropZoneId) => void;
  /** Set the currently hovered drop zone */
  setOverDropZone: (id: DropZoneId | null) => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/** Return type for useDraggable hook */
export interface UseDraggableReturn {
  /** Whether this specific item is being dragged */
  isDragging: boolean;
  /** Whether drag is currently pending (within activation threshold) */
  isPending: boolean;
  /** Props to spread on the draggable element */
  draggableProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    tabIndex: number;
    role: string;
    "aria-pressed": boolean;
    "aria-disabled": boolean;
    style: React.CSSProperties;
  };
  /** Props to spread on a drag handle (if using separate handle) */
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
}

/** Return type for useDropZone hook */
export interface UseDropZoneReturn {
  /** Current state of the drop zone */
  dropState: DropState;
  /** Whether this zone is currently active (can receive drops) */
  isActive: boolean;
  /** Props to spread on the drop zone element */
  dropZoneProps: {
    ref: React.RefCallback<HTMLElement>;
    "aria-dropeffect": "move" | "none";
    style: React.CSSProperties;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/** Collision detection algorithm */
export type CollisionAlgorithm =
  | "pointer"
  | "rect-intersection"
  | "closest-center";

/** Collision detection result */
export interface CollisionResult {
  /** ID of the colliding drop zone */
  dropZoneId: DropZoneId;
  /** Intersection ratio (0-1) */
  ratio: number;
}
