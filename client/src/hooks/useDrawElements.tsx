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
  const { roughElements } = useCanvasElementStore(['roughElements']);

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
  }, [roughElements, appWidth, appHeight]);
};

export default useDrawElements;
