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
    renderCanvasElements(
      canvas,
      ctx,
      {
        elementIds: allIds,
        p1,
        p2,
        angles,
        types,
        fillColors,
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
    fillColors,
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
