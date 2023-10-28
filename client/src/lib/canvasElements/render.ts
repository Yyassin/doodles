import { CanvasElement } from '@/stores/CanvasElementsStore';
import { TransformHandleType, TransformHandles } from '@/types';

/**
 * Various rendering helpers to render specific
 * items to the canvas.
 * @author Yousef Yassin
 */

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
  ctx.save();
  ctx.rotate(angle);

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
  },
  elementId: string,
) => {
  const { p1, p2 } = appState;
  const { x: elementX1, y: elementY1 } = p1[elementId];
  const { x: elementX2, y: elementY2 } = p2[elementId];

  const elementWidth = elementX2 - elementX1;
  const elementHeight = elementY2 - elementY1;

  const linePadding = 6 / zoomValue;

  ctx.save();
  ctx.strokeStyle = selectionColour;
  ctx.lineWidth = 2 / zoomValue;
  strokeRectWithRotation(
    ctx,
    elementX1 - linePadding,
    elementY1 - linePadding,
    elementWidth + linePadding * 2,
    elementHeight + linePadding * 2,
    0,
  );
};

/**
 * Renders the specified transform handles onto the provided canvas.
 * @param ctx The canvas context.
 * @param transformHandles The transform handles to render.
 */
export const renderTransformHandles = (
  ctx: CanvasRenderingContext2D,
  transformHandles: TransformHandles,
) => {
  Object.keys(transformHandles).forEach((key) => {
    const transformHandle = transformHandles[key as TransformHandleType];
    if (transformHandle !== undefined) {
      const [x, y, width, height] = transformHandle;

      ctx.save();
      ctx.lineWidth = 1 / zoomValue;
      ctx.strokeStyle = selectionColour;

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
