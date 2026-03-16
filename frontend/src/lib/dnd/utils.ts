/**
 * @fileoverview Utility functions for the DnD library
 */

import type { Point, Rect } from "./types";

// ============================================================================
// Point Utilities
// ============================================================================

/** Create a point from x, y coordinates */
export function point(x: number, y: number): Point {
  return { x, y };
}

/** Calculate the distance between two points */
export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/** Calculate the delta (difference) between two points */
export function delta(from: Point, to: Point): Point {
  return { x: to.x - from.x, y: to.y - from.y };
}

/** Add two points together */
export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Subtract point b from point a */
export function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Get the center point of a rectangle */
export function center(rect: Rect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// ============================================================================
// Rectangle Utilities
// ============================================================================

/** Get a Rect from a DOM element's bounding client rect */
export function getRect(element: HTMLElement): Rect {
  const domRect = element.getBoundingClientRect();
  return {
    top: domRect.top,
    left: domRect.left,
    right: domRect.right,
    bottom: domRect.bottom,
    width: domRect.width,
    height: domRect.height,
  };
}

/** Check if a point is inside a rectangle */
export function isPointInRect(pt: Point, rect: Rect): boolean {
  return (
    pt.x >= rect.left &&
    pt.x <= rect.right &&
    pt.y >= rect.top &&
    pt.y <= rect.bottom
  );
}

/** Check if two rectangles intersect */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

/** Calculate the intersection area of two rectangles */
export function intersectionArea(a: Rect, b: Rect): number {
  const xOverlap = Math.max(
    0,
    Math.min(a.right, b.right) - Math.max(a.left, b.left),
  );
  const yOverlap = Math.max(
    0,
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
  );
  return xOverlap * yOverlap;
}

/** Calculate intersection ratio (0-1) of rect a over rect b */
export function intersectionRatio(a: Rect, b: Rect): number {
  const area = intersectionArea(a, b);
  const aArea = a.width * a.height;
  return aArea > 0 ? area / aArea : 0;
}

// ============================================================================
// Collision Detection
// ============================================================================

/**
 * Pointer collision - checks if the pointer position is inside the rect
 * Simple and precise for single-point collision
 */
export function pointerCollision(pointer: Point, rect: Rect): boolean {
  return isPointInRect(pointer, rect);
}

/**
 * Rectangle intersection collision - checks if draggable rect overlaps drop zone
 * Better for larger draggables
 */
export function rectCollision(
  draggableRect: Rect,
  dropZoneRect: Rect,
): boolean {
  return rectsIntersect(draggableRect, dropZoneRect);
}

/**
 * Closest center collision - finds the drop zone whose center is closest
 * to the draggable center
 */
export function closestCenterDistance(
  draggableRect: Rect,
  dropZoneRect: Rect,
): number {
  const draggableCenter = center(draggableRect);
  const dropZoneCenter = center(dropZoneRect);
  return distance(draggableCenter, dropZoneCenter);
}

// ============================================================================
// Event Utilities
// ============================================================================

/** Extract point from mouse event */
export function getMousePoint(event: MouseEvent | React.MouseEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

/** Extract point from touch event (first touch) */
export function getTouchPoint(
  event: TouchEvent | React.TouchEvent,
): Point | null {
  const touch = event.touches[0] || event.changedTouches[0];
  if (!touch) return null;
  return { x: touch.clientX, y: touch.clientY };
}

/** Get point from either mouse or touch event */
export function getEventPoint(
  event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
): Point | null {
  if ("touches" in event) {
    return getTouchPoint(event);
  }
  return getMousePoint(event as MouseEvent);
}

// ============================================================================
// DOM Utilities
// ============================================================================

/** Check if an element or its ancestors match a selector */
export function matchesAncestor(
  element: Element | null,
  selector: string,
): boolean {
  while (element) {
    if (element.matches(selector)) return true;
    element = element.parentElement;
  }
  return false;
}

/** Prevent default and stop propagation */
export function stopEvent(event: Event | React.SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

/** Generate a unique ID for draggables/drop zones */
export function generateId(prefix: string = "dnd"): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

// ============================================================================
// Type Guards
// ============================================================================

/** Check if value is a Point */
export function isPoint(value: unknown): value is Point {
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    "y" in value &&
    typeof (value as Point).x === "number" &&
    typeof (value as Point).y === "number"
  );
}

/** Check if value is a Rect */
export function isRect(value: unknown): value is Rect {
  return (
    typeof value === "object" &&
    value !== null &&
    "top" in value &&
    "left" in value &&
    "right" in value &&
    "bottom" in value &&
    "width" in value &&
    "height" in value
  );
}
