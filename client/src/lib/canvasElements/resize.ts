import { CanvasElement } from '@/stores/CanvasElementsStore';
import { TransformHandleDirection, Vector2 } from '@/types';
import { centerPoint, rotate, rotatePoint } from '../math';
import { EPSILON } from '@/constants';

/**
 * Helper methods to deal with coordinate
 * manipulations when resizing element bounding boxes.
 * @author Yousef Yassin
 */

/**
 * Resizes the bounding box defined by `coordinates` according
 * to the provided client mouse position and the transform handle being used.
 * @param clientX The client mouse x coordinate.
 * @param clientY The client mouse y coordinate.
 * @param position The position / label of the transform handle being used to resize.
 * @param coordinates The current bounding box coordinates to resize.
 * @returns The resized coordinates.
 */
export const resizedCoordinates = (
  clientX: number,
  clientY: number,
  angle: number,
  position: TransformHandleDirection,
  coordinates: { x1: number; y1: number; x2: number; y2: number },
) => {
  const { x1, y1, x2, y2 } = coordinates;

  const startTopLeft = [x1, y1] as [number, number];
  const startBottomRight = [x2, y2] as [number, number];
  const startCenter = centerPoint(startTopLeft, startBottomRight);

  // Rotate pointer to work in axis-aligned coordinate system
  const rotatedPointer = rotate(
    clientX,
    clientY,
    startCenter[0],
    startCenter[1],
    -angle,
  );

  // Calculate scaling to apply based on pointer
  const boundsCurrentWidth = x2 - x1 + EPSILON;
  const boundsCurrentHeight = y2 - y1 + EPSILON;
  const atStartBoundsWidth = startBottomRight[0] - startTopLeft[0] + EPSILON;
  const atStartBoundsHeight = startBottomRight[1] - startTopLeft[1] + EPSILON;
  let scaleX = atStartBoundsWidth / boundsCurrentWidth;
  let scaleY = atStartBoundsHeight / boundsCurrentHeight;
  //console.log(scaleX, scaleY);
  if (position.includes('e')) {
    scaleX = (rotatedPointer[0] - startTopLeft[0]) / boundsCurrentWidth;
  }
  if (position.includes('s')) {
    scaleY = (rotatedPointer[1] - startTopLeft[1]) / boundsCurrentHeight;
  }
  if (position.includes('w')) {
    scaleX = (startBottomRight[0] - rotatedPointer[0]) / boundsCurrentWidth;
  }
  if (position.includes('n')) {
    scaleY = (startBottomRight[1] - rotatedPointer[1]) / boundsCurrentHeight;
  }

  // Calculate new bounds
  const eleNewWidth = boundsCurrentWidth * scaleX + EPSILON;
  const eleNewHeight = boundsCurrentHeight * scaleY + EPSILON;
  const [newBoundsX1, newBoundsY1, newBoundsX2, newBoundsY2] = [
    x1,
    y1,
    x1 + eleNewWidth,
    y1 + eleNewHeight,
  ];
  const newBoundsWidth = newBoundsX2 - newBoundsX1 + EPSILON;
  const newBoundsHeight = newBoundsY2 - newBoundsY1 + EPSILON;
  //console.log(newBoundsHeight, newBoundsWidth);

  // Calculate new topLeft based on fixed corner during resize
  let newTopLeft = [...startTopLeft] as [number, number];
  if (['n', 'w', 'nw'].includes(position)) {
    newTopLeft = [
      startBottomRight[0] - newBoundsWidth,
      startBottomRight[1] - newBoundsHeight,
    ];
  }
  if (position === 'ne') {
    const bottomLeft = [startTopLeft[0], startBottomRight[1]];
    newTopLeft = [bottomLeft[0], bottomLeft[1] - newBoundsHeight];
  }
  if (position === 'sw') {
    const topRight = [startBottomRight[0], startTopLeft[1]];
    newTopLeft = [topRight[0] - newBoundsWidth, topRight[1]];
  }

  // Adjust topLeft to new rotation point
  const rotatedTopLeft = rotatePoint(newTopLeft, startCenter, angle);
  const newCenter = [
    newTopLeft[0] + newBoundsWidth / 2,
    newTopLeft[1] + newBoundsHeight / 2,
  ] as [number, number];
  const rotatedNewCenter = rotatePoint(newCenter, startCenter, angle);
  newTopLeft = rotatePoint(rotatedTopLeft, rotatedNewCenter, -angle);

  return {
    x1: newTopLeft[0],
    y1: newTopLeft[1],
    x2: newTopLeft[0] + newBoundsWidth,
    y2: newTopLeft[1] + newBoundsHeight,
  };
};

/**
 * Our transforms use an AABB with two corners. We assume (x1, y1) is the top
 * left and that (x2, y2) is the bottom right. However, if someone starts a drawing
 * from teh bottom right then that doesn't work.
 *
 * This method reorders the coordinates of the element with the specified id to follow
 * the above convention so it can be safely assumed in the rest of the codebase.
 * @param p1 The current 'top left' point of the element's bb.
 * @param p2 The current 'bottom right' point of the element's bb.
 * @param elementType The element's type.
 * @returns The adjusted coordinates.
 */
export const adjustElementCoordinates = (
  p1: Vector2,
  p2: Vector2,
  elementType: CanvasElement['type'],
) => {
  let { x: x1, y: y1 } = p1;
  let { x: x2, y: y2 } = p2;

  if (
    elementType === 'rectangle' ||
    elementType === 'circle' ||
    elementType === 'image' ||
    elementType === 'freehand'
  ) {
    [x1, x2] = [x1, x2].sort((a, b) => a - b);
    [y1, y2] = [y1, y2].sort((a, b) => a - b);

    // x1, y1 is top left (so min in both)
    return { x1, y1, x2, y2 };
  } else {
    // This is a line. We make the left most, or
    // top most point (x1, y1).
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      // we need to swap the vertices
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

/**
 * Our transforms use an AABB with two corners. We assume (x1, y1) is the top
 * left and that (x2, y2) is the bottom right. However, if someone starts a drawing
 * from teh bottom right then that doesn't work.
 *
 * This method reorders the coordinates of the element with the specified id to follow
 * the above convention so it can be safely assumed in the rest of the codebase.
 * @param elementId Id of the element to adjust the coordinates for.
 * @param appState The app state, which contains the element params.
 * @returns The adjusted coordinates.
 */
export const adjustElementCoordinatesById = (
  elementId: string,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
  },
  skip = false,
) => {
  const { p1, p2, types } = appState;
  if (skip) {
    return {
      x1: p1[elementId].x,
      y1: p1[elementId].y,
      x2: p2[elementId].x,
      y2: p2[elementId].y,
    };
  }
  return adjustElementCoordinates(
    p1[elementId],
    p2[elementId],
    types[elementId],
  );
};

/**
 * Rescales a set of points along a specified dimension ('x' or 'y') to a new size.
 *
 * @param dim The dimension along which the points should be rescaled ('x' or 'y').
 * @param newSize The new size to which the points should be scaled.
 * @param points An array of Vector2 representing the points to be rescaled.
 * @param translateInPlace Flag indicating whether to translate the points
 * in place in order to normalize them within the new bounds.
 * @returns An array of rescaled Vector2 points.
 */
const rescalePoints = (
  dim: 'x' | 'y',
  newSize: number,
  points: Vector2[],
  translateInPlace: boolean,
): Vector2[] => {
  const coords = points.map((point) => point[dim]);
  const maxCoord = Math.max(...coords);
  const minCoord = Math.min(...coords);
  // Calculate the current size along the specified dimension
  const size = maxCoord - minCoord;

  // Calculate the scale factor for rescaling
  // TODO: This forces same oriented, could consider allowing flips somehow
  const scale = size === 0 ? 1 : Math.abs(newSize / size);

  // Apply scaling
  let newMinCoord = Infinity;
  const scaledPoints = points.map((point): Vector2 => {
    const newCoordinate = point[dim] * scale;
    const newPoint = { ...point };
    newPoint[dim] = newCoordinate;
    newMinCoord = Math.min(newCoordinate, newMinCoord);
    return newPoint as unknown as Vector2;
  });

  // Normalize, if specified:
  if (!translateInPlace) {
    return scaledPoints;
  }
  const translation = minCoord - newMinCoord;
  return scaledPoints.map((scaledPoint) => ({
    ...scaledPoint,
    [dim]: scaledPoint[dim] + translation,
  }));
};

/**
 * Rescales a set of points to fit within the provided width and height.
 *
 * @param points An array of Vector2 representing the points to be rescaled.
 * @param width The new width to which the points should be rescaled.
 * @param height The new height to which the points should be rescaled.
 * @param translateInPlace Flag indicating whether to translate the points
 * in place in order to normalize them within the new bounds.
 * @returns An array of rescaled points.
 */
export const rescalePointsInElem = (
  points: Vector2[],
  width: number,
  height: number,
  translateInPlace: boolean,
) =>
  rescalePoints(
    'x',
    width,
    rescalePoints('y', height, points, translateInPlace),
    translateInPlace,
  );
