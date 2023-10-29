import { renderTransformFrame } from '@/lib/canvasElements/transform';
import { ObjectValues } from '@/lib/misc';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useLayoutEffect } from 'react';
import rough from 'roughjs';

/**
 * Hook that's subscribed to the roughElements
 * state and will trigger a rerender, redrawing all elements,
 * whenever an element is updated.
 * @author Yousef Yassin
 */
const useDrawElements = () => {
  const { appHeight, appWidth } = useAppStore(['appHeight', 'appWidth']);
  const { roughElements, selectedElementId, p1, p2, types } =
    useCanvasElementStore([
      'roughElements',
      'selectedElementId',
      'p1',
      'p2',
      'types',
    ]);

  // Effect fires after DOM is mounted
  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas === null) return;

    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    // Clear on each rerender
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);

    // Render each element
    ObjectValues(roughElements).forEach((roughElement) =>
      roughCanvas.draw(roughElement),
    );

    // Highlight selected elements (only 1 for now). We ignore
    // lines for the moment.
    if (selectedElementId === '' || types[selectedElementId] === 'line') return;
    [selectedElementId].forEach((id) => {
      renderTransformFrame(ctx, { p1, p2 }, id);
    });
  }, [roughElements, selectedElementId, types, p1, p2, appWidth, appHeight]);
};

export default useDrawElements;
