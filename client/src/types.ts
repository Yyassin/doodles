/**
 * Common type definitions used across the application
 * @authors Yousef Yassin
 */

/** General */
export type Vector2 = { x: number; y: number };

/** App */
/* Supported application modes, these are tools and actions the user may use. */
export const AppModes = ['select', 'pan', 'line', 'rectangle'] as const;
export type AppMode = (typeof AppModes)[number];

/* Suppored application themes, these change the app's global appearance. */
export const AppThemes = ['light', 'dark'] as const;
export type AppTheme = (typeof AppThemes)[number];

/** Canvas Elements */
/* Supported canvas element types */
export const CanvasElementTypes = ['line', 'rectangle'] as const;
export type CanvasElementType = (typeof CanvasElementTypes)[number];

/* Supported canvas element fill styles */
export const CanvasElementFillStyles = [
  'none',
  'hachure',
  'solid',
  'zigzag',
  'cross-hatch',
  'dots',
  'dashed',
  'zigzag-line',
] as const;
export type CanvasElementFillStyle = (typeof CanvasElementFillStyles)[number];
