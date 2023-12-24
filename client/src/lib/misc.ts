/**
 * Defines miscellaneous helpers used across the application.
 * @authors Yousef Yassin
 */

/**
 * Typed version of object.values.
 * @param obj The object to get typed values for.
 * @returns The typed values array.
 */
export const ObjectValues = <T>(obj: Record<string, T>): T[] => {
  return Object.keys(obj).map((key) => obj[key]);
};

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
