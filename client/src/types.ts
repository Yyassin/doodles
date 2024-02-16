/**
 * Common type definitions used across the application
 * @authors Yousef Yassin
 */

import { ValueOf } from './lib/misc';

/** General */
export type Vector2 = { x: number; y: number };
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

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
  | 'writing'
  | 'rotating';

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

export const DrawingTools = [
  'line',
  'rectangle',
  'circle',
  'freehand',
  'text',
] as const;
export type DrawingTool = (typeof DrawingTools)[number];
export const drawingToolsSet = new Set(DrawingTools);

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
  'image',
  'selection',
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

/* Used for text offset */
interface fontOffsets {
  [font: string]: {
    [size: number]: number;
  };
}
/* Maps text offset to font and size */
export const fontSizeOffsets: fontOffsets = {
  'brush Script MT, cursive': {
    14: 2,
    24: 4,
    30: 6,
    40: 8,
    60: 10,
  },
  'times new roman': {
    14: 1,
    24: 3,
    30: 4,
    40: 6,
    60: 8,
  },
  'trebuchet MS': {
    14: 2,
    24: 4,
    30: 5,
    40: 7,
    60: 9,
  },
  garamond: {
    14: 2,
    24: 4,
    30: 5,
    40: 5,
    60: 9,
  },
  'courier New': {
    14: 1,
    24: 2,
    30: 2,
    40: 2,
    60: 4,
  },
  'Comic Sans MS': {
    14: 5,
    24: 8,
    30: 11,
    40: 14,
    60: 21,
  },
};

/** Names of common events subscribed by event listeners */
export enum EVENT {
  KEYDOWN = 'keydown',
  KEYPRESS = 'keypress',
  WHEEL = 'wheel',
  KEYUP = 'keyup',
  FOCUS = 'focus',
  POINTER_UP = 'pointerup',
  RESIZE = 'resize',
  // ws events
  MESSAGE = 'message',
  OPEN = 'open',
  CLOSE = 'close',
  ERROR = 'error',
}

/** Supported image file types */
export const IMAGE_MIME_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  jfif: 'image/jfif',
} as const;

/** Supported file types  */
export const MIME_TYPES = {
  json: 'application/json',
  // binary
  binary: 'application/octet-stream',
  // image
  ...IMAGE_MIME_TYPES,
} as const;
export type FILE_EXTENSION = Exclude<keyof typeof MIME_TYPES, 'binary'>;

/** Encapsulating interface for binary-stored content (images normally) */
export type BinaryFileData = {
  // The file type
  mimeType: ValueOf<typeof IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary;
  // Unique hash id
  id: string;
  // Blob url for loading (base64)
  dataURL: string;
  // Epoch, in milliseconds
  created: number;
  /**
   * Indicates when the file was last retrieved from storage to be loaded
   * onto the scene. This can be used to determine whether to delete unused
   * files from storage.
   *
   * Epoch, in milliseconds.
   */
  lastRetrieved?: number;
};

// Electron Media stream source.
export interface StreamSource {
  name: string;
  id: string;
  thumbnail: {
    dataURL: string;
    aspect: number;
  };
  display_id: string;
  appIcon: {
    dataURL: string;
  };
}
