import { BoundingBox, TransformHandleDirection, Vector2 } from '@/types';

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
 * Rotates the point (x, y) about the point (cx, cx)
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

/**
 * Rotates the point (x, y) about the point (cx, cx)
 * by the specified angle
 * @param p The point to rotate.
 * @param c The center point to rotate about.
 * @param angle The angle to rotate by.
 * @returns The rotated point.
 */
export const rotatePoint = (
  p: [number, number],
  c: [number, number],
  angle: number,
): [number, number] => rotate(p[0], p[1], c[0], c[1], angle);

/**
 * Retrieves the midpoint of the line segment ab.
 * @param a The point defined by a.
 * @param b The point defined by b.
 * @returns The midpoint of ab.
 */
export const centerPoint = (
  a: [number, number],
  b: [number, number],
): [number, number] => {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
};

/**
 * Normalizes an angle to the range [0, 2π).
 * @param angle The input angle in radians.
 * @returns The normalized angle in the range [0, 2π).
 */
export const normalizeAngle = (angle: number): number => {
  if (angle < 0) {
    return angle + 2 * Math.PI;
  }
  if (angle >= 2 * Math.PI) {
    return angle - 2 * Math.PI;
  }
  return angle;
};

/**
 * Computes the axis aligned bounding box corresponding to the specified oriented box.
 * @param bounds The axis aligned bounds of the oriented box.
 * @param center The axis aligned center of the oriented box.
 * @param angle The oriented box's orientation angle.
 * @returns The axis aligned bounding box.
 */
export const getOrientedBounds = (
  bounds: BoundingBox,
  center: [number, number],
  angle: number,
): BoundingBox => {
  const { x1, x2, y1, y2 } = bounds;
  const [cx, cy] = center;

  // Compute the other two corners of the rectangle
  const x3 = x1;
  const y3 = y2;
  const x4 = x2;
  const y4 = y1;

  // Rotate all four corners
  const [rotatedX1, rotatedY1] = rotate(x1, y1, cx, cy, angle);
  const [rotatedX2, rotatedY2] = rotate(x2, y2, cx, cy, angle);
  const [rotatedX3, rotatedY3] = rotate(x3, y3, cx, cy, angle);
  const [rotatedX4, rotatedY4] = rotate(x4, y4, cx, cy, angle);

  // Find the axis-aligned bounds of the rotated box
  const minX = Math.min(rotatedX1, rotatedX2, rotatedX3, rotatedX4);
  const minY = Math.min(rotatedY1, rotatedY2, rotatedY3, rotatedY4);
  const maxX = Math.max(rotatedX1, rotatedX2, rotatedX3, rotatedX4);
  const maxY = Math.max(rotatedY1, rotatedY2, rotatedY3, rotatedY4);

  return { x1: minX, y1: minY, x2: maxX, y2: maxY };
};
