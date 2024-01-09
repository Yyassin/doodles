/**
 * Defines miscellaneous helpers used across the application.
 * @authors Yousef Yassin
 */

import { AppTool, DrawingTool, drawingToolsSet } from '@/types';

/**
 * Typed version of object.values.
 * @param obj The object to get typed values for.
 * @returns The typed values array.
 */
export const ObjectValues = <T>(obj: Record<string, T>): T[] => {
  return Object.keys(obj).map((key) => obj[key]);
};

/**
 * Retrieves the values of a mapped container, as a type.
 */
export type ValueOf<T> = T[keyof T];

/**
 * Capitalizes the specified string.
 * @param s The string to capitalize.
 * @returns The capitalized string
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Clamps a value between a minimum and maximum.
 * @param value The value to clamp.
 * @param min The minimum bound.
 * @param max The maximum bound.
 * @returns The clamped value.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Retrieves a referencce to the DOM canvas and its context.
 * @returns A reference to the canvas and 2D context.
 */
export const getCanvasContext = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  return { canvas, ctx: canvas?.getContext('2d') };
};

/**
 * Sets the canvas cursor to the one supplied.
 * @param cursor The cursor to set.
 */
export const setCursor = (cursor: string) => {
  const { canvas } = getCanvasContext();
  if (canvas === null) return;
  canvas.style.cursor = cursor;
};

/**
 * Creates a debounced version of a function that delays its invocation
 * until after a specified timeout. If the debounced function is called
 * again before the timeout elapses, the previous invocation is canceled.
 *
 * @param fn The function to be debounced.
 * @param timeout The time (milliseconds) to wait before invoking the function.
 * @returns A debounced function with additional methods 'flush' and 'cancel'.
 */
export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  timeout: number,
) => {
  let timeoutHandle = 0;
  // Store the last arguments passed to the debounced function
  let lastArgs: T | null = null;

  // The debounced function
  const ret = (...args: T) => {
    // Store the current arguments, for flush.
    lastArgs = args;
    clearTimeout(timeoutHandle);
    // Set a new timer to invoke the function after the specified timeout
    timeoutHandle = window.setTimeout(() => {
      lastArgs = null;
      fn(...args);
    }, timeout);
  };

  // Force the immediate invocation of the debounced function
  ret.flush = () => {
    clearTimeout(timeoutHandle);
    if (lastArgs) {
      const _lastArgs = lastArgs;
      lastArgs = null;
      fn(..._lastArgs);
    }
  };

  // Cancels the pending invocation of the debounced function
  ret.cancel = () => {
    lastArgs = null;
    clearTimeout(timeoutHandle);
  };

  return ret;
};

/**
 * Checks if the specified tool is a drawing tool.
 * @returns True if the tool is a drawing tool, false otherwise.
 */
export const isDrawingTool = (tool: AppTool): tool is DrawingTool =>
  drawingToolsSet.has(tool as DrawingTool);
