import { renderTransformFrame } from '@/lib/canvasElements/transform';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useLayoutEffect } from 'react';
import {
  getScaleOffset,
  renderSelectionFrame,
} from '@/lib/canvasElements/render';
import { getCanvasContext } from '@/lib/misc';
import { renderCanvasElements } from '@/lib/canvasElements/renderScene';

/**
 * Hook that's subscribed to the roughElements
 * state and will trigger a rerender, redrawing all elements,
 * whenever an element is updated.
 * @authors Yousef Yassin, Dana El Sherif
 */
const useDrawElements = () => {
  const { appHeight, appWidth, zoom, panOffset, action } = useAppStore([
    'appHeight',
    'appWidth',
    'zoom',
    'panOffset',
    'action',
  ]);
  const {
    selectedElementIds,
    p1,
    p2,
    types,
    fillColors,
    allIds,
    freehandPoints,
    freehandBounds,
    textStrings,
    fileIds,
    isImagePlaceds,
    angles,
    selectionFrame,
    roughElements,
  } = useCanvasElementStore([
    'roughElements',
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'fillColors',
    'allIds',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'selectionFrame',
  ]);

  // Effect fires after DOM is mounted
  useLayoutEffect(() => {
    const { canvas, ctx } = getCanvasContext();
    if (ctx === null || canvas === null) return;

    // Clear on each rerender
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Retrieve the scaling offset to apply for centered zoom
    // (TODO: We can change this to zoom towards mouse position)
    const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);

    // Temporarily apply scaling
    // Panning & zooming
    ctx.save();
    ctx.translate(
      panOffset.x * zoom - scaleOffset.x,
      panOffset.y * zoom - scaleOffset.y,
    );
    ctx.scale(zoom, zoom);

    // Render each element
<<<<<<< HEAD
    allIds.forEach((id) => {
      const { x: x1, y: y1 } = p1[id] ?? { x: 0, y: 0 };
      const { x: x2, y: y2 } = p2[id] ?? { x: 0, y: 0 };
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
        const points = freehandPoints[id];
        if (points !== undefined) {
          drawStroke(ctx, getStroke(points, { size: 5 }));
        }
      } else if (type === 'text') {
        // Skip anything being edited
        if (!(action === 'writing' && id === selectedElementId)) {
          ctx.textBaseline = 'top';
          ctx.font = '24px sans-serif';

          const fillColor = fillColors[id] ?? '#000000';
          ctx.fillStyle = fillColor;
          ctx.fillText(textStrings[id], p1[id].x, p1[id].y);
        }
      } else if (type === 'image') {
        if (!isImagePlaceds[id]) return;

        const { x: x1, y: y1 } = p1[id];
        const { x: x2, y: y2 } = p2[id];
        const [width, height] = [x2 - x1, y2 - y1];

        const imgFileId = fileIds[id];
        const img = imgFileId
          ? imageCache.cache.get(imgFileId)?.image
          : undefined;
        if (img !== undefined && !(img instanceof Promise)) {
          ctx.drawImage(img, x1, y1, width, height);
        } else {
          drawImagePlaceholder(width, height, ctx);
        }
      } else {
        const roughElement = roughElements[id];
        roughElement && roughCanvas.draw(roughElement);
      }

      // Cleanup
      ctx.restore();
    });
=======
    renderCanvasElements(
      canvas,
      ctx,
      {
        elementIds: allIds,
        p1,
        p2,
        angles,
        types,
        freehandPoints,
        freehandBounds,
        textStrings,
        isImagePlaceds,
        fileIds,
        roughElements,
      },
      undefined,
      (id: string) =>
        !(action === 'writing' && selectedElementIds.includes(id)),
    );
>>>>>>> 5b8026e91269df6c5a8a0228052673bbcb523d58

    // Highlight selected elements (only 1 for now). We ignore
    // lines for the moment, and don't highlight while editing text.
    if (action !== 'writing') {
      selectedElementIds.forEach((id) => {
        renderTransformFrame(ctx, { p1, p2, angles, types }, id);
      });
    }

    // Draw the selection frame, if any
    selectionFrame && renderSelectionFrame(selectionFrame, zoom, ctx);

    // Restore canvas pre-scaling and panning.
    ctx.restore();
  }, [
    allIds,
    selectedElementIds,
    types,
    p1,
    p2,
    appWidth,
    appHeight,
    zoom,
    panOffset,
    action,
    fileIds,
    isImagePlaceds,
    angles,
    roughElements,
    selectionFrame,
  ]);
};

export default useDrawElements;
