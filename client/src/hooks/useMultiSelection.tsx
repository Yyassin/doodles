import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { useEffect } from 'react';

/**
 * Hook that subscribes to the selection element and computes
 * the selected elements on every change.
 * @author Yousef Yassin
 */

const useMultiSelection = () => {
  const { selectionFrame, setSelectedElements, allIds, p1, p2 } =
    useCanvasElementStore([
      'selectionFrame',
      'setSelectedElements',
      'allIds',
      'p1',
      'p2',
    ]);

  useEffect(() => {
    if (selectionFrame === null) return;

    const elementsWithinSelection = getElementsWithinFrame(
      { elementIds: allIds, p1, p2 },
      selectionFrame,
    );
    setSelectedElements(elementsWithinSelection);
  }, [selectionFrame, allIds, p1, p2]);
};

/**
 * Retrieves element IDs within a specified frame in the canvas.
 *
 * @param appState The application state containing element IDs, and positions (p1, p2) of canvas elements.
 * @param frame The frame represented by its top-left (p1) and bottom-right (p2) coordinates.
 * @returns An array of element IDs that fall within the specified frame.
 */
const getElementsWithinFrame = (
  appState: {
    elementIds: string[];
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  frame: {
    p1: CanvasElement['p1'];
    p2: CanvasElement['p2'];
  },
) => {
  // Destructure properties from appState
  const { elementIds, p1, p2 } = appState;

  // Destructure coordinates of the frame
  const { x: frameX1, y: frameY1 } = frame.p1;
  const { x: frameX2, y: frameY2 } = frame.p2;

  // Filter element IDs based on whether their positions fall within the frame
  return elementIds.filter((id) => {
    const { x: x1, y: y1 } = p1[id];
    const { x: x2, y: y2 } = p2[id];

    // Check if the element is within the frame boundaries
    return frameX1 <= x1 && frameY1 <= y1 && frameX2 >= x2 && frameY2 >= y2;
  });
};

export default useMultiSelection;
