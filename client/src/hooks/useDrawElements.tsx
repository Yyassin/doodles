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
import { useElectronIPCStore } from '@/stores/ElectronIPCStore';

/**
 * Hook that's subscribed to the roughElements
 * state and will trigger a rerender, redrawing all elements,
 * whenever an element is updated.
 * @authors Yousef Yassin, Dana El Sherif
 */
const useDrawElements = () => {
  const { windowBounds } = useElectronIPCStore(['windowBounds']);
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
    fontFamilies,
    fontSizes,
    allIds,
    freehandPoints,
    freehandBounds,
    textStrings,
    fileIds,
    isImagePlaceds,
    angles,
    selectionFrame,
    roughElements,
    opacities,
    strokeColors,
    strokeWidths,
  } = useCanvasElementStore([
    'roughElements',
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'fillColors',
    'fontFamilies',
    'fontSizes',
    'allIds',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'selectionFrame',
    'opacities',
    'strokeColors',
    'strokeWidths',
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
    const { x: boundsTx, y: boundsTy } = windowBounds;

    console.log(boundsTx, boundsTy);

    // Temporarily apply scaling
    // Panning & zooming
    ctx.save();
    ctx.translate(
      boundsTx + panOffset.x * zoom - scaleOffset.x,
      boundsTy + panOffset.y * zoom - scaleOffset.y,
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
        fontFamilies,
        fontSizes,
        freehandPoints,
        freehandBounds,
        textStrings,
        isImagePlaceds,
        fileIds,
        roughElements,
        opacities,
        strokeColors,
        strokeWidths,
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
    fontFamilies,
    fontSizes,
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
    opacities,
    strokeColors,
    strokeWidths,
  ]);
};

export default useDrawElements;
