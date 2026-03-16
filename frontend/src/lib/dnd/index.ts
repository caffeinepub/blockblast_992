/**
 * @fileoverview DnD Library - A lightweight drag and drop system for React
 *
 * @example Basic Usage
 * ```tsx
 * import { DnDProvider, useDraggable, useDropZone, DragOverlay } from './lib/dnd';
 *
 * function App() {
 *   return (
 *     <DnDProvider>
 *       <DraggableItem />
 *       <DropArea />
 *       <DragOverlay>
 *         {(payload) => <ItemPreview item={payload} />}
 *       </DragOverlay>
 *     </DnDProvider>
 *   );
 * }
 *
 * function DraggableItem({ item }) {
 *   const { isDragging, draggableProps } = useDraggable({
 *     id: item.id,
 *     type: 'item',
 *     data: item,
 *   });
 *
 *   return <div {...draggableProps}>{item.name}</div>;
 * }
 *
 * function DropArea({ onDrop }) {
 *   const { dropState, dropZoneProps } = useDropZone({
 *     id: 'drop-area',
 *     accept: 'item',
 *     onDrop: (item, position) => onDrop(item),
 *   });
 *
 *   return <div {...dropZoneProps}>Drop here</div>;
 * }
 * ```
 */

// Types
export * from "./types";

// Utilities
export * from "./utils";

// Context & Provider
export { DnDProvider, useDnDContext, useDnDContextOptional } from "./context";
export type { DnDProviderProps } from "./context";

// Hooks
export { useDraggable } from "./useDraggable";
export { useDropZone } from "./useDropZone";

// Components
export { DragOverlay, SimpleDragOverlay } from "./DragOverlay";
export type { DragOverlayProps } from "./DragOverlay";
