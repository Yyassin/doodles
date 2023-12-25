import { CanvasElement } from '@/stores/CanvasElementsStore';
import { TransformHandleType, TransformHandles } from '@/types';
import { centerPoint } from '../math';

/**
 * Various rendering helpers to render specific
 * items to the canvas.
 * @author Yousef Yassin
 */

/**
 * Retrieves the scaling offset in <x, y> to apply as a translation
 * pre-scaling to result in a centered zoom post-scaling.
 * @param height The app (canvas) height.
 * @param width The app (canvas) width.
 * @param zoom The current zoom level applied.
 * @returns The scale offset.
 */
export const getScaleOffset = (height: number, width: number, zoom: number) => {
  const scaledWidth = width * zoom;
  const scaledHeight = height * zoom;
  return {
    x: (scaledWidth - width) / 2,
    y: (scaledHeight - height) / 2,
  };
};

// TODO: These will be passed in from state.
const selectionColour = '#818cf8';
const zoomValue = 1;

/**
 * Draws a circle with the specified parameters
 * on the provided canvas.
 * @param context The canvas context.
 * @param cx The circle's center x coordinate.
 * @param cy The circle's center y coordinate.
 * @param radius The circle's radius.
 * @param stroke If true, provides an outline to the circle.
 */
const fillCircle = (
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  stroke = true,
) => {
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  if (stroke) {
    context.stroke();
  }
};

/**
 * Renders a rectangle with the specified parameters to the
 * provided canvas.
 * @param ctx The canvas context.
 * @param x Rectangle top left x coordinate.
 * @param y Rectangle top left y coordinate.
 * @param width The rectangle's width.
 * @param height The rectangle's height.
 * @param angle The rectangle's angle.
 * @param borderRadius The rectangle's border radius.
 */
const strokeRectWithRotation = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  borderRadius = 3,
) => {
  const [cx, cy] = centerPoint([x, y], [x + width, y + height]);

  // Translate context to element center so rotation and scale
  // originate from center.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  // Revert since it isn't accounted for in the actual drawing.
  ctx.translate(-cx, -cy);

  if (borderRadius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, borderRadius);
    ctx.stroke();
    ctx.closePath();
  } else {
    ctx.strokeRect(x, y, width, height);
  }
  ctx.restore();
};

/**
 * Renders a selection border frame (no transform handles)
 * for the element specified by the provided id.
 * @param ctx The canvas context.
 * @param appState The app state, containing the element.
 * @param elementId The id of the element to draw a border for.
 */
export const renderSelectionBorder = (
  ctx: CanvasRenderingContext2D,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    angles: Record<string, CanvasElement['angle']>;
  },
  elementId: string,
) => {
  const { p1, p2, angles } = appState;
  const { x: x1, y: y1 } = p1[elementId];
  const { x: x2, y: y2 } = p2[elementId];

  const elementWidth = x2 - x1;
  const elementHeight = y2 - y1;

  // If we switch the corners while resizing, simply invert
  // padding rather than swapping coordinates around.
  const widthInversion = Math.sign(elementWidth);
  const heightInversion = Math.sign(elementHeight);

  const linePadding = 6 / zoomValue;

  ctx.save();
  ctx.strokeStyle = selectionColour;
  ctx.lineWidth = 2 / zoomValue;
  strokeRectWithRotation(
    ctx,
    x1 - widthInversion * linePadding,
    y1 - heightInversion * linePadding,
    elementWidth + widthInversion * linePadding * 2,
    elementHeight + heightInversion * linePadding * 2,
    angles[elementId],
  );
  ctx.restore();
};

/**
 * Renders the specified transform handles onto the provided canvas.
 * @param ctx The canvas context.
 * @param transformHandles The transform handles to render.
 */
export const renderTransformHandles = (
  ctx: CanvasRenderingContext2D,
  transformHandles: TransformHandles,
  angle = 0,
) => {
  Object.keys(transformHandles).forEach((key) => {
    const transformHandle = transformHandles[key as TransformHandleType];
    if (transformHandle !== undefined) {
      const [x, y, width, height] = transformHandle;

      ctx.save();
      ctx.lineWidth = 1 / zoomValue;
      ctx.strokeStyle = selectionColour;

      // Rotate the handles to match element orientation, translate
      // so rotation is applied from the handle's center
      ctx.translate(x + width / 2, y + width / 2);
      ctx.rotate(angle);
      ctx.translate(-x - width / 2, -y - width / 2);

      if (key === 'rotation') {
        // Rotation handles are circles.
        fillCircle(ctx, x + width / 2, y + height / 2, width / 2);
      } else {
        // And all other handles are rectangles.
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 2 / zoomValue);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  });
};
