import { CanvasElement } from '@/stores/CanvasElementsStore';
import { distance, nearPoint } from '../math';

/**
 * Various canvas element selection helpers.
 * @author Yousef
 */

/**
 * Returns the string corresponding to the cursor
 * style for the specified position.
 * @param position The position to get the style for.
 * @returns The cursor style.
 */
export const cursorForPosition = (position: string) => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    default:
      return 'move';
  }
};

/**
 * Checks if the position (x, y) is near the element
 * with id `elementId`. If so, returns the relative position.
 * @param x The x coordinate of the position to check.
 * @param y The y coordinate of the position to check.
 * @param appState The app state to get element props.
 * @param elementId Id of the element to check nearness on.
 * @returns The relative cursor position, or null if not near.
 */
export const positionWithinElement = (
  x: number,
  y: number,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
  },
  elementId: string,
) => {
  // Grab the element's BB bounds.
  const { p1, p2, types } = appState;
  const elementType = types[elementId];
  const { x: x1, y: y1 } = p1[elementId];
  const { x: x2, y: y2 } = p2[elementId];

  // If it's a rectangle check nearness against corners or
  // inside if inside all the bounds.
  if (elementType === 'rectangle') {
    const topLeft = nearPoint(x, y, x1, y1, 'tl');
    const topRight = nearPoint(x, y, x2, y1, 'tr');
    const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
    const bottomRight = nearPoint(x, y, x2, y2, 'br');
    // Within if mouse is between extents
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;

    // Only one of these should ever be true -- unless the shape is small
    // but it's still possible to force one since inside is first.
    return inside || topLeft || topRight || bottomLeft || bottomRight;
  } else {
    // Otherwise, it's a line. Measure the distance of the cursor
    // to both line endpoints. If it's close to the actual line length
    // then we are near the line.

    // TODO: Could do distance from point to line??

    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y }; // mouse pos

    // TODO: Can we optimize with no sqrt?
    const offset = Math.abs(distance(a, b) - (distance(c, a) + distance(c, b)));

    // TODO: Can early return
    const start = nearPoint(x, y, x1, y1, 'nw');
    const end = nearPoint(x, y, x2, y2, 'se');
    const inside = Math.abs(offset) < 1 ? 'inside' : null;
    return inside || start || end;
  }
};

/**
 * Provided all the elements in app state, returns
 * the first (in insertion order) to be "near" the
 * the specified position (x, y).
 * @param x The x coordinate of the position to check.
 * @param y The y coordinate of the position to check.
 * @param appState The app state, containing all the elements.
 * @returns The first element to be near's id and the cursor's
 * relative position to it, if any. Undefined otherwise.
 */
export const getElementAtPosition = (
  x: number,
  y: number,
  appState: {
    allIds: string[];
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
  },
) => {
  // TODO:
  // Disadvantage: O(n) and it only returns the first element this satisfies -- will
  // be an issue for overlapping elements.
  // One solution is adding some sort of layering (move to front/back)
  // for each element. We have to find all that intersect and select front most.
  return appState.allIds
    .map((id) => ({
      id,
      position: positionWithinElement(x, y, appState, id),
    }))
    .find((element) => element.position !== null);
};
