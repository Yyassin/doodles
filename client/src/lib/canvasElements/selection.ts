import { CanvasElement } from '@/stores/CanvasElementsStore';
import { distance, nearPoint, rotate } from '../math';
import {
  CanvasElementType,
  MaybeTransformHandleType,
  TransformHandle,
  TransformHandleType,
  Vector2,
} from '@/types';
import {
  getLinearTransformHandlesFromCoords,
  getTransformHandlesFromCoords,
} from './transform';

/**
 * Various canvas element selection helpers.
 * @author Yousef
 */

/**
 * Rotates the cursor type based on rotated element such
 * that the cursor still makes sense.
 * @param cursor The cursor, as selected in the axis-aligned frame.
 * @param angle The orientation of the selected element.
 * @returns The rotated cursor.
 */
const RESIZE_CURSORS = ['ns', 'nesw', 'ew', 'nwse'];
const rotateResizeCursor = (cursor: string, angle: number) => {
  const index = RESIZE_CURSORS.indexOf(cursor);
  if (index >= 0) {
    const a = Math.round(angle / (Math.PI / 4));
    cursor = RESIZE_CURSORS[(index + a) % RESIZE_CURSORS.length];
  }
  return cursor;
};

/**
 * Returns the string corresponding to the cursor
 * style for the specified position / near handle.
 * @param transformHandleType The position / near handle. to get the style for.
 * @returns The cursor style.
 */
export const cursorForPosition = (
  transformHandleType: MaybeTransformHandleType | 'inside',
  angle = 0,
  p1: Vector2,
  p2: Vector2,
  type: CanvasElementType,
): string => {
  let cursor = null;

  // The resize behaviour for lines necessitates the use of
  // of nw, se for simplicity. This is wrong if p1 (left most) is
  // below p2, so we fix it visually here.
  if (type === 'line') {
    const { y: y1 } = p1;
    const { y: y2 } = p2;
    if (y1 > y2 && transformHandleType !== 'inside') {
      transformHandleType = transformHandleType === 'nw' ? 'sw' : 'ne';
    }
  }

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

  // The cursor direction should be rotated for consistency
  // if the element has been rotated.
  if (cursor && angle) {
    cursor = rotateResizeCursor(cursor, angle);
  }

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
    angles: Record<string, CanvasElement['angle']>;
    types: Record<string, CanvasElement['type']>;
  },
  x: number,
  y: number,
): MaybeTransformHandleType => {
  const { selectedElementIds, p1, p2, angles, types } = appState;

  if (elementId !== selectedElementIds) {
    return false;
  }

  // TODO: Potential optimization if we cache this.
  const { rotation: rotationTransformHandle, ...transformHandles } =
    types[elementId] === 'line'
      ? getLinearTransformHandlesFromCoords(
          { p1, p2, angles },
          selectedElementIds,
        )
      : getTransformHandlesFromCoords(
          { p1, p2, angles },
          selectedElementIds,
          {},
        );

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
    angles: Record<string, CanvasElement['angle']>;
    selectedElementId: string;
  },
  selection: string,
): MaybeTransformHandleType | 'inside' => {
  const { p1, p2, types, selectedElementId, angles } = appState;
  const elementType = types[selection];
  if (!['rectangle', 'line', 'text', 'image'].includes(elementType))
    return false;
  const { x: x1, y: y1 } = p1[selection];
  const { x: x2, y: y2 } = p2[selection];

  const transformHandle = resizeTest(
    selection,
    { selectedElementIds: selectedElementId, p1, p2, angles, types },
    x,
    y,
  );

  if (
    elementType === 'rectangle' ||
    elementType === 'image' ||
    elementType === 'text'
  ) {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const angle = angles[selection];

    // The provide p1, p2 coords are axis aligned. Effectively, this
    // means we've rotated by -angle to get there (since we're ignoring rotation).
    // Hence, we must rotate our mouse position by the same amount for consistency,
    // and this allows us to still use the extents test in the rotated coordinate system.
    const [rx, ry] = rotate(x, y, cx, cy, -angle);

    // Within if mouse is between extents
    const inside =
      rx >= x1 && rx <= x2 && ry >= y1 && ry <= y2 ? 'inside' : false;

    // Only one of these should ever be true -- unless the shape is small
    // but it's still possible to force one since inside is first.
    return transformHandle || inside;
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
    const inside = Math.abs(offset) < 1 ? 'inside' : false;

    return transformHandle || inside;
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
    angles: Record<string, CanvasElement['angle']>;
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
