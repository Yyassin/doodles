import { CanvasElement } from '@/stores/CanvasElementsStore';
import { MIME_TYPES, TransformHandleType, TransformHandles } from '@/types';
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
 * Renders a selection frame on a canvas.
 * @param selectionFrame The selection frame object with two points p1 and p2.
 * @param zoom The zoom factor for scaling.
 * @param ctx The canvas rendering context.
 */
export const renderSelectionFrame = (
  selectionFrame: Pick<CanvasElement, 'p1' | 'p2'>,
  zoom: number,
  ctx: CanvasRenderingContext2D,
  fillColour = 'rgba(0, 0, 200, 0.04)',
  borderColour = ' rgb(255, 101, 219)',
) => {
  const { x: x1, y: y1 } = selectionFrame.p1;
  const { x: x2, y: y2 } = selectionFrame.p2;
  const [width, height] = [x2 - x1, y2 - y1];

  ctx.save();
  ctx.translate(x1, y1);
  ctx.fillStyle = fillColour;

  // render from 0.5px offset  to get 1px wide line
  // https://stackoverflow.com/questions/7530593/html5-canvas-and-line-width/7531540#7531540
  // TODO can be be improved by offseting to the negative when user selects
  // from right to left
  const offset = 0.5 / zoom;

  ctx.fillRect(offset, offset, width, height);
  ctx.lineWidth = 1 / zoom;
  ctx.strokeStyle = borderColour;
  ctx.strokeRect(offset, offset, width, height);
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
  isLinear = false,
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

      if (key === 'rotation' || isLinear) {
        // Rotation handles are circles, same with line endpoints.
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

/**
 * Generates an SVG path string from a series of stroke points.
 * The input is an array of [x, y] coordinate pairs representing the stroke.
 *
 * @param stroke An array of [x, y] coordinate pairs representing the stroke path.
 * @returns An SVG path string representing the smoothed stroke path.
 */
const generateSvgPathFromStroke = (stroke: number[][]) => {
  // If the stroke array is empty, return an empty string
  if (!stroke.length) return '';

  // Create a smoothed SVG path string from the stroke points
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      // Calculate the midpoint between the current and next points
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q'], // Initial "Move to" command and first control point
  );
  // Close the path
  d.push('Z');
  // Join the array to form the final SVG path
  return d.join(' ');
};

/**
 * Draws a smoothed stroke path on the specified 2D canvas context.
 *
 * @param ctx Context of the canvas on which to draw the stroke.
 * @param strokePoints An array of [x, y] coordinate pairs representing the stroke points.
 */
export const drawStroke = (
  ctx: CanvasRenderingContext2D,
  strokePoints: number[][],
) => {
  // Generate a smoothed SVG path from the stroke points using a specified size
  const stroke = generateSvgPathFromStroke(strokePoints);
  // TODO: Potential optimization by caching or saving Path2Ds
  // Draw the filled path on the canvas using the Path2D object
  ctx.fill(new Path2D(stroke));
};

/**
 * A placeholder image to render while another
 * image is being loaded.
 */
const IMAGE_PLACEHOLDER_IMG = document.createElement('img');
IMAGE_PLACEHOLDER_IMG.src = `data:${MIME_TYPES.svg},${encodeURIComponent(
  `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="image" class="svg-inline--fa fa-image fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#888" d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"></path></svg>`,
)}`;

/**
 * Renders a placeholder image on the canvas if the intended
 * image is still being loaded.
 * @param width Width of the placeholder.
 * @param height Height of the placeholder.
 * @param context Drawing context of the canvas to draw on.
 */
export const drawImagePlaceholder = (
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
) => {
  ctx.fillStyle = '#E7E7E7';
  ctx.fillRect(0, 0, width, height);

  const imageMinWidthOrHeight = Math.min(width, height);
  const size = Math.min(
    imageMinWidthOrHeight,
    Math.min(imageMinWidthOrHeight * 0.4, 100),
  );

  ctx.drawImage(
    IMAGE_PLACEHOLDER_IMG,
    width / 2 - size / 2,
    height / 2 - size / 2,
    size,
    size,
  );
};
