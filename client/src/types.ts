/**
 * Common type definitions used across the application
 * @authors Yousef Yassin
 */

/** General */
export type Vector2 = { x: number; y: number };

/** Canvas Element Selection */
/* The 4 sides, and 4 corners of a canvas element BB. */
export type TransformHandleDirection =
  | 'n'
  | 's'
  | 'w'
  | 'e'
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se';
/* A transform handle is defined by it's position (side/corner) or it can be a rotation. */
export type TransformHandleType = TransformHandleDirection | 'rotation';
/* A transform handle: the position [x, y] and size [width, height] */
export type TransformHandle = [number, number, number, number];
/* A given canvas element's handles, labelled by their position. */
export type TransformHandles = Partial<{
  [T in TransformHandleType]: TransformHandle;
}>;
/* Falsable transform handle type */
export type MaybeTransformHandleType = TransformHandleType | false;

/** App */
export const AppModes = ['signup', 'signin', 'canvas', 'dashboard'] as const;
export type AppMode = (typeof AppModes)[number];
// Canvas actions defining FSM states
export type Action =
  | 'none'
  | 'drawing'
  | 'resizing'
  | 'moving'
  | 'panning'
  | 'writing';

/* Supported application tools, these are tools and actions the user may use. */
export const AppTools = [
  'select',
  'pan',
  'text',
  'freehand',
  'rectangle',
  'circle',
  'line',
  'image',
  'erase',
] as const;
export type AppTool = (typeof AppTools)[number];

/* Suppored application themes, these change the app's global appearance. */
export const AppThemes = ['light', 'dark'] as const;
export type AppTheme = (typeof AppThemes)[number];

/** Canvas Elements */
/* Supported canvas element types */
export const CanvasElementTypes = [
  'line',
  'rectangle',
  'circle',
  'freehand',
  'text',
] as const;
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

/** Customizability Toolbar */
export const colourTypes = [
  'redCircle',
  'greenCircle',
  'blueCircle',
  'orangeCircle',
  'blackCircle',
] as const;
export type colourType = (typeof colourTypes)[number];
