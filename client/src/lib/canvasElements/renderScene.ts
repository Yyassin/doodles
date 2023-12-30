import { CanvasElement } from '@/stores/CanvasElementsStore';
import { Vector2 } from '@/types';
import rough from 'roughjs';
import { drawImagePlaceholder, drawStroke } from './render';
import getStroke from 'perfect-freehand';
import { imageCache } from '../cache';
import { createElement, defaultOptions } from './canvasElementUtils';

/**
 * Entire scene rendering helpers.
 * @author Yousef Yassin
 */

/**
 * Renders canvas elements on the specified canvas using the provided rendering context.
 *
 * @param canvas The HTML canvas element on which to render the elements.
 * @param ctx The rendering context of the canvas.
 * @param appState The application state containing information about canvas elements.
 * @param offset Optional offset to apply to the rendered elements.
 * @param renderTextPredicate Predicate function to determine whether to render text elements.
 */
export const renderCanvasElements = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  appState: {
    elementIds: string[];
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    angles: Record<string, CanvasElement['angle']>;
    types: Record<string, CanvasElement['type']>;
    freehandPoints: Record<string, CanvasElement['freehandPoints']>;
    textStrings: Record<string, CanvasElement['text']>;
    isImagePlaceds: Record<string, CanvasElement['isImagePlaced']>;
    fileIds: Record<string, CanvasElement['fileId']>;
    roughElements: Record<string, CanvasElement['roughElement']>;
  },
  offset?: Vector2,
  renderTextPredicate: (id: string) => boolean = () => true,
) => {
  const {
    elementIds,
    p1,
    p2,
    angles,
    types,
    freehandPoints,
    textStrings,
    isImagePlaceds,
    fileIds,
  } = appState;
  const roughElements = appState.roughElements ?? {};
  const { x: offsetX, y: offsetY } = offset ?? { x: 0, y: 0 };
  const roughCanvas = rough.canvas(canvas);
  // Plot the selected elements
  elementIds.forEach((id) => {
    let { x: x1, y: y1 } = p1[id] ?? { x: 0, y: 0 };
    let { x: x2, y: y2 } = p2[id] ?? { x: 0, y: 0 };
    x1 = x1 - offsetX;
    x2 = x2 - offsetX;
    y1 = y1 - offsetY;
    y2 = y2 - offsetY;

    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const angle = angles[id] ?? 0;

    // Translate context to element center so rotation and scale
    // originate from center.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    // Revert since it isn't accounted for in the actual drawing.
    ctx.translate(-cx, -cy);

    const type = types[id];
    if (type === 'freehand') {
      let points = freehandPoints[id];
      if (points !== undefined) {
        points = points.map(({ x, y }) => ({
          x: x - offsetX,
          y: y - offsetY,
        }));
        drawStroke(ctx, getStroke(points, { size: 5 }));
      }
    } else if (type === 'text') {
      // Skip anything being edited
      console.log(renderTextPredicate(id));
      if (renderTextPredicate(id)) {
        ctx.textBaseline = 'top';
        ctx.font = '24px sans-serif';
        ctx.fillText(textStrings[id], x1, y1);
      }
    } else if (type === 'image') {
      if (isImagePlaceds[id]) {
        const [width, height] = [Math.abs(x2 - x1), Math.abs(y2 - y1)];

        const imgFileId = fileIds[id];
        const img = imgFileId
          ? imageCache.cache.get(imgFileId)?.image
          : undefined;
        if (img !== undefined && !(img instanceof Promise)) {
          ctx.drawImage(img, x1, y1, width, height);
        } else {
          drawImagePlaceholder(width, height, ctx);
        }
      }
    } else {
      const roughElement =
        offset !== undefined
          ? createElement(id, x1, y1, x2, y2, types[id], undefined, {
              ...defaultOptions,
              ...roughElements[id]?.options,
              opacity: 1,
              text: '',
            }).roughElement
          : roughElements[id];
      roughElement && roughCanvas.draw(roughElement);
    }

    // Cleanup
    ctx.restore();
  });
};
