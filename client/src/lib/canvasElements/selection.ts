import { CanvasElement } from '@/stores/CanvasElementsStore';
import { distance, nearPoint } from '../math';
import {
  MaybeTransformHandleType,
  TransformHandle,
  TransformHandleType,
} from '@/types';
import { getTransformHandlesFromCoords } from './transform';

/**
 * Various canvas element selection helpers.
 * @author Yousef
 */

/**
 * Returns the string corresponding to the cursor
 * style for the specified position / near handle.
 * @param transformHandleType The position / near handle. to get the style for.
 * @returns The cursor style.
 */
export const cursorForPosition = (
  transformHandleType: MaybeTransformHandleType | 'inside',
): string => {
  let cursor = null;

  switch (transformHandleType) {
    case 'n':
    case 's':
      cursor = 'ns';
      break;
    case 'w':
    case 'e':
      cursor = 'ew';
      break;
    case 'nw':
    case 'se':
      cursor = 'nwse';
      break;
    case 'ne':
    case 'sw':
      cursor = 'nesw';
      break;
    case 'rotation':
      return 'grab';
    default:
      return 'move';
  }

  // if (cursor && element) {
  //   cursor = rotateResizeCursor(cursor, element.angle);
  // }

  return cursor ? `${cursor}-resize` : '';
};

/**
 * Checks whether the provided (x, y) position
 * is within the provided handle's bounds.
 * @param transformHandle The handle to check for [x, y, w, h].
 * @param x The position to check's x coordinate.
 * @param y The position to check's y coordinate.
 * @returns True if the position is inside the handle, false otherwise.
 */
const isInsideTransformHandle = (
  transformHandle: TransformHandle,
  x: number,
  y: number,
) =>
  x >= transformHandle[0] &&
  x <= transformHandle[0] + transformHandle[2] &&
  y >= transformHandle[1] &&
  y <= transformHandle[1] + transformHandle[3];

/**
 * Checks which, if any, transform handle the provided (x, y)
 * position is above relative to the element with teh specified id.
 * @param elementId Id of the element who's handles to consider.
 * @param appState Application state, which includes the element's state.
 * @param x The position to check's x coordinate.
 * @param y The position to check's y coordinate.
 * @returns The handle the position is above, if any. False otherwise.
 */
export const resizeTest = (
  elementId: string,
  appState: {
    // Eventually, an array
    selectedElementIds: string;
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  x: number,
  y: number,
): MaybeTransformHandleType => {
  const { selectedElementIds, p1, p2 } = appState;

  if (elementId !== selectedElementIds) {
    return false;
  }

  // TODO: Potential optimization if we cache this.
  const { rotation: rotationTransformHandle, ...transformHandles } =
    getTransformHandlesFromCoords({ p1, p2 }, selectedElementIds, {
      rotation: true,
    });

  if (
    rotationTransformHandle &&
    isInsideTransformHandle(rotationTransformHandle, x, y)
  ) {
    return 'rotation' as TransformHandleType;
  }

  const filter = Object.keys(transformHandles).filter((key) => {
    const transformHandle =
      transformHandles[key as Exclude<TransformHandleType, 'rotation'>];
    if (transformHandle === undefined) {
      return false;
    }
    return isInsideTransformHandle(transformHandle, x, y);
  });

  if (filter.length > 0) {
    return filter[0] as TransformHandleType;
  }

  return false;
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
const positionWithinElement = (
  x: number,
  y: number,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
    selectedElementId: string;
  },
  selection: string,
): MaybeTransformHandleType | 'inside' => {
  const { p1, p2, types, selectedElementId } = appState;
  const elementType = types[selection];
  if (!['rectangle', 'line', 'text'].includes(elementType)) return false;
  const { x: x1, y: y1 } = p1[selection];
  const { x: x2, y: y2 } = p2[selection];

  if (elementType === 'rectangle' || elementType === 'text') {
    const transformHandle = resizeTest(
      selection,
      { selectedElementIds: selectedElementId, p1, p2 },
      x,
      y,
    );
    // Within if mouse is between extents
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;

    // Only one of these should ever be true -- unless the shape is small
    // but it's still possible to force one since inside is first.
    return inside || transformHandle;
  } else {
    // TODO: Could do distance from point to line
    // Line -- what we do is measure dist from point to
    // both endpoints. If it's close enough to line length
    // then we say this is selecting the line.
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y }; // mouse pos

    // TODO: Can we optimize with no sqrt?
    const offset = Math.abs(distance(a, b) - (distance(c, a) + distance(c, b)));

    const start = nearPoint(x, y, x1, y1, 'nw'); // so it resizes x1, y1
    const end = nearPoint(x, y, x2, y2, 'se'); // so it resizes x2, y2
    const inside = Math.abs(offset) < 1 ? 'inside' : false;
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
    selectedElementId: string;
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
    .find((element) => element.position);
};
