import { TransformHandleDirection, Vector2 } from '@/types';

/**
 * Math related helper functions.
 * @author Yousef Yassin
 */

/**
 * Returns the euclidean distance between
 * the specified 2D points a, and b.
 * @param a The first point.
 * @param b The second point.
 * @returns The distance between the points.
 */
export const distance = (a: Vector2, b: Vector2) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

/**
 * Checks if the specified point (x, y) is near (x1, y1). Nearness
 * implies a distance less than thresh.
 * @param x The x coordinate of the first point.
 * @param y The y coordinate of the first point.
 * @param x1 The x coordinate of the target.
 * @param y1 The y coordinate of the target
 * @param name The handle name to return if true.
 * @param thresh The threshold to determine nearness.
 * @returns The name if the points are near eachother, null otherwise.
 */
export const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: TransformHandleDirection,
  thresh = 5,
) => {
  return Math.abs(x - x1) < thresh && Math.abs(y - y1) < thresh ? name : false;
};

/**
 * Rotates the lines point (x, y) about the point (cx, cx)
 * by the specified angle
 * @param x The x coordinate of the point to rotate.
 * @param y The y coordinate of the point to rotate.
 * @param cx The x coordinate of the center of rotation.
 * @param cy The y coordinate of the center of rotation.
 * @param angle The angle to rotate by.
 * @returns The rotated point.
 */
export const rotate = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  angle: number,
): [number, number] =>
  // https://math.stackexchange.com/a/2205033
  {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const [dx, dy] = [x - cx, y - cy];
    return [dx * cos - dy * sin + cx, dx * sin + dy * cos + cy];
  };
