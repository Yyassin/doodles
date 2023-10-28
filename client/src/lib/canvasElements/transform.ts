import { CanvasElement } from '@/stores/CanvasElementsStore';
import {
  TransformHandle,
  TransformHandleType,
  TransformHandles,
} from '@/types';
import { rotate } from '../math';
import { renderSelectionBorder, renderTransformHandles } from './render';

// TODO: This will be passed in from state.
const zoomValue = 1;

/**
 * Creates transform handles (positions (top left x, y) and size (width, height)) for an
 * object with the specified center and rotation angle.
 * @param x The transform handle's center x coordinate.
 * @param y The transform handle's center y coordinate.
 * @param width The handle's width.
 * @param height The handle's height.
 * @param cx The element the handle belongs to's center x.
 * @param cy The element the handle belongs to's center y.
 * @param angle The element the handle belong to's rotation angle.
 * @returns The handle [top left x, top left y, width, height].
 */
const generateTransformHandle = (
  x: number,
  y: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  angle = 0,
): TransformHandle => {
  const [xx, yy] = rotate(x + width / 2, y + height / 2, cx, cy, angle);
  return [xx - width / 2, yy - height / 2, width, height];
};

/**
 * Generates all the transform handles for the element with
 * the specified id.
 * @param appState The app state, which includes the element.
 * @param elementId Id of the element to get handles for.
 * @param omitSides Boolean record of labels of handles to ignore, if any.
 * @returns The transform handles.
 */
export const getTransformHandlesFromCoords = (
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  elementId: string,
  omitSides: { [T in TransformHandleType]?: boolean } = {},
) => {
  const { p1, p2 } = appState;
  const { x: x1, y: y1 } = p1[elementId];
  const { x: x2, y: y2 } = p2[elementId];

  const size = 8;
  const handleWidth = size / zoomValue;
  const handleHeight = size / zoomValue;

  const handleMarginX = size / zoomValue;
  const handleMarginY = size / zoomValue;

  const width = x2 - x1;
  const height = y2 - y1;
  // Rect only for now
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  // Fixed for now
  const angle = 0;

  // Line padding - half height
  const dashedLineMargin = 6 / zoomValue - handleHeight / 2;
  const centeringOffset = 0;

  const transformHandles: TransformHandles = {
    nw: omitSides.nw
      ? undefined
      : generateTransformHandle(
          x1 - dashedLineMargin - handleMarginX + centeringOffset,
          y1 - dashedLineMargin - handleMarginY + centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    ne: omitSides.ne
      ? undefined
      : generateTransformHandle(
          x2 + dashedLineMargin - centeringOffset,
          y1 - dashedLineMargin - handleMarginY + centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    sw: omitSides.sw
      ? undefined
      : generateTransformHandle(
          x1 - dashedLineMargin - handleMarginX + centeringOffset,
          y2 + dashedLineMargin - centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    se: omitSides.se
      ? undefined
      : generateTransformHandle(
          x2 + dashedLineMargin - centeringOffset,
          y2 + dashedLineMargin - centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    rotation: omitSides.rotation
      ? undefined
      : generateTransformHandle(
          x1 + width / 2 - handleWidth / 2,
          y1 -
            dashedLineMargin -
            handleMarginY +
            centeringOffset -
            16 / zoomValue,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
  };

  const transformHandleSizes = 8;
  const minimumSizeForEightHandles = (5 * transformHandleSizes) / zoomValue;
  if (Math.abs(width) > minimumSizeForEightHandles) {
    if (!omitSides.n) {
      transformHandles.n = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y1 - dashedLineMargin - handleMarginY + centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.s) {
      transformHandles.s = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y2 + dashedLineMargin - centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }
  if (Math.abs(height) > minimumSizeForEightHandles) {
    if (!omitSides.w) {
      transformHandles.w = generateTransformHandle(
        x1 - dashedLineMargin - handleMarginX + centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.e) {
      transformHandles.e = generateTransformHandle(
        x2 + dashedLineMargin - centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }

  return transformHandles;
};

/**
 * Renders the frame highlight and transform handles
 * for the element with the specified id, on the provided canvas.
 * @param ctx The canvas context.
 * @param appState The app state, which includes the element info.
 * @param elementId Id of the element to render the frame for.
 */
export const renderTransformFrame = (
  ctx: CanvasRenderingContext2D,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  elementId: string,
) => {
  const transformHandles = getTransformHandlesFromCoords(appState, elementId, {
    rotation: true, // We don't have rotation support yet
  });
  renderSelectionBorder(ctx, appState, elementId);
  renderTransformHandles(ctx, transformHandles);
};
