import { CanvasElement } from '@/stores/CanvasElementsStore';
import { TransformHandleDirection, Vector2 } from '@/types';

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
  position: TransformHandleDirection,
  coordinates: { x1: number; y1: number; x2: number; y2: number },
) => {
  const { x1, y1, x2, y2 } = coordinates;
  // x1, y1 is the top left corner. x2, y2 is the bottom right.
  // We edit the corner/size that is selected.
  switch (position) {
    case 'nw':
      return { x1: clientX, y1: clientY, x2, y2 };
    case 'ne':
      return { x1, y1: clientY, x2: clientX, y2 };
    case 'sw':
      return { x1: clientX, x2, y1, y2: clientY };
    case 'se':
      return { x1, y1, x2: clientX, y2: clientY };
    case 'n':
      return { x1, y1: clientY, x2, y2 };
    case 'e':
      return { x1, y1, x2: clientX, y2 };
    case 's':
      return { x1, y1, x2, y2: clientY };
    case 'w':
      return { x1: clientX, y1, x2, y2 };
    default:
      throw new Error(
        `Something went wrong. Resize position ${position} is invalid.`,
      );
  }
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
