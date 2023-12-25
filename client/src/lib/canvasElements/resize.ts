import { CanvasElement } from '@/stores/CanvasElementsStore';
import { TransformHandleDirection, Vector2 } from '@/types';
import { centerPoint, rotate, rotatePoint } from '../math';

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
  const boundsCurrentWidth = x2 - x1;
  const boundsCurrentHeight = y2 - y1;
  const atStartBoundsWidth = startBottomRight[0] - startTopLeft[0];
  const atStartBoundsHeight = startBottomRight[1] - startTopLeft[1];
  let scaleX = atStartBoundsWidth / boundsCurrentWidth;
  let scaleY = atStartBoundsHeight / boundsCurrentHeight;
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
  const eleNewWidth = boundsCurrentWidth * scaleX;
  const eleNewHeight = boundsCurrentHeight * scaleY;
  const [newBoundsX1, newBoundsY1, newBoundsX2, newBoundsY2] = [
    x1,
    y1,
    x1 + eleNewWidth,
    y1 + eleNewHeight,
  ];
  const newBoundsWidth = newBoundsX2 - newBoundsX1;
  const newBoundsHeight = newBoundsY2 - newBoundsY1;

  // Calculate new topLeft based on fixed corner during resize
  let newTopLeft = [...startTopLeft] as [number, number];
  if (['n', 'w', 'nw'].includes(position)) {
    newTopLeft = [
      startBottomRight[0] - Math.abs(newBoundsWidth),
      startBottomRight[1] - Math.abs(newBoundsHeight),
    ];
  }
  if (position === 'ne') {
    const bottomLeft = [startTopLeft[0], startBottomRight[1]];
    newTopLeft = [bottomLeft[0], bottomLeft[1] - Math.abs(newBoundsHeight)];
  }
  if (position === 'sw') {
    const topRight = [startBottomRight[0], startTopLeft[1]];
    newTopLeft = [topRight[0] - Math.abs(newBoundsWidth), topRight[1]];
  }

  // Adjust topLeft to new rotation point
  const rotatedTopLeft = rotatePoint(newTopLeft, startCenter, angle);
  const newCenter = [
    newTopLeft[0] + Math.abs(newBoundsWidth) / 2,
    newTopLeft[1] + Math.abs(newBoundsHeight) / 2,
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
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  // TODO: Temporary, this is a bug
  if (elementType === 'circle') {
    return { x1, x2, y1, y2 };
  }
  if (elementType === 'rectangle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // x1, x2 is top left (so min in both)
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
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
) => {
  const { p1, p2, types } = appState;
  return adjustElementCoordinates(
    p1[elementId],
    p2[elementId],
    types[elementId],
  );
};
