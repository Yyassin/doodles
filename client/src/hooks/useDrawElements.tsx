import { ObjectValues } from '@/lib/misc';
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
  const { roughElements } = useCanvasElementStore(['roughElements']);

  // Effect fires after DOM is mounted
  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    // Clear on each rerender
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);

    // Render each element
    ObjectValues(roughElements).forEach((roughElement) =>
      roughCanvas.draw(roughElement),
    );
  }, [roughElements]);
};

export default useDrawElements;
