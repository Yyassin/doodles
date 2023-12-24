import { renderTransformFrame } from '@/lib/canvasElements/transform';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useLayoutEffect } from 'react';
import rough from 'roughjs';
import getStroke from 'perfect-freehand';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { getCanvasContext } from '@/lib/misc';

const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q'],
  );
  d.push('Z');
  return d.join(' ');
};

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
    roughElements,
    selectedElementId,
    p1,
    p2,
    types,
    allIds,
    freehandPoints,
    textStrings,
  } = useCanvasElementStore([
    'roughElements',
    'selectedElementId',
    'p1',
    'p2',
    'types',
    'allIds',
    'freehandPoints',
    'textStrings',
  ]);

  // Effect fires after DOM is mounted
  useLayoutEffect(() => {
    const { canvas, ctx } = getCanvasContext();
    if (ctx === null || canvas === null) return;

    // Clear on each rerender
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);

    // Retrieve the scaling offset to apply for centered zoom
    // (TODO: We can change this to zoom towards mouse position)
    const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);

    // Temporarily apply scaling
    //Panning & zooming
    ctx.save();
    ctx.translate(
      panOffset.x * zoom - scaleOffset.x,
      panOffset.y * zoom - scaleOffset.y,
    );
    ctx.scale(zoom, zoom);

    // Render each element
    allIds.forEach((id) => {
      const type = types[id];
      if (type === 'freehand') {
        const points = freehandPoints[id];
        if (points === undefined) return;
        const stroke = getSvgPathFromStroke(getStroke(points, { size: 5 }));
        // TODO: Potential optimization by saving Path2Ds
        ctx.fill(new Path2D(stroke));
      } else if (type === 'text') {
        // Skip anything being edited
        if (action === 'writing' && id === selectedElementId) {
          return;
        }
        ctx.textBaseline = 'top';
        ctx.font = '24px sans-serif';
        ctx.fillText(textStrings[id], p1[id].x, p1[id].y);
      } else {
        const roughElement = roughElements[id];
        roughElement && roughCanvas.draw(roughElement);
      }
    });

    // Highlight selected elements (only 1 for now). We ignore
    // lines for the moment, and don't highlight while editing text.
    if (
      !(
        selectedElementId === '' ||
        types[selectedElementId] === 'line' ||
        action === 'writing'
      )
    ) {
      [selectedElementId].forEach((id) => {
        renderTransformFrame(ctx, { p1, p2 }, id);
      });
    }

    // Restore canvas pre-scaling and panning
    ctx.restore();
  }, [
    allIds,
    selectedElementId,
    types,
    p1,
    p2,
    appWidth,
    appHeight,
    zoom,
    panOffset,
    action,
  ]);
};

export default useDrawElements;
